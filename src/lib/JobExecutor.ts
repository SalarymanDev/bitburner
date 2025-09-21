import { NetscriptPort, NS } from '@ns'
import { NetworkScanner } from '/lib/NetworkScanner';
import { Queue } from '/lib/Queue';
import { VirtualHost } from '/lib/VirtualHost';
import { IJob } from '/lib/Job';

export class JobExecutor {
    private inputPort: NetscriptPort;
    private outputPort: NetscriptPort;
    private network: NetworkScanner;
    private jobQueue: Queue<IJob> = new Queue<IJob>();
    private jobsExecuted: Set<IJob> = new Set<IJob>();
    private completeJobs: IJob[] = [];
    private virtualHost: VirtualHost;

    constructor(private ns: NS, inputPort: number, outputPort: number) {
        this.inputPort = ns.getPortHandle(inputPort);
        this.outputPort = ns.getPortHandle(outputPort);
        this.outputPort.clear();
        this.network = new NetworkScanner(ns);
        this.updateVirtualHost();
        this.ns.disableLog('ALL');
    }
    
    public async run(): Promise<void> {
        while(true) {
            this.trackRunningJobs();
            this.outputCompletedJobs();
            this.fetchJobs();

            // No Jobs
            if (this.jobQueue.isEmpty()) {
                await this.ns.sleep(10);
                continue;
            }

            this.updateVirtualHost();
            this.executeJob();

            await this.ns.sleep(10);
        }
    }

    private trackRunningJobs(): void {
        for (const job of this.jobsExecuted) {
            job.processes.forEach(process => {
                process.complete = !this.ns.isRunning(process.pid, process.host);
            });

            const runningProcesses = job.processes.filter(process => !process.complete);
            if (runningProcesses.length === 0) {
                this.completeJobs.push(job);
                this.jobsExecuted.delete(job);
            }
        }
    }

    private outputCompletedJobs(): void {
        if (this.outputPort.full()) return;
        if (this.completeJobs.length === 0) return;

        const completedJob = this.completeJobs.shift() as IJob;
        this.ns.print(`Completed Job ${completedJob.id}`);
        const jobJson = JSON.stringify(completedJob);
        this.outputPort.write(jobJson);
    }

    private updateVirtualHost(): void {
        this.network.update();
        this.virtualHost = new VirtualHost(this.ns, this.network.getRootedNetworkMinusHome());
    }

    private fetchJobs(): void {
        if (this.inputPort.empty()) return;

        while(!this.inputPort.empty()) {
            const jobJson = this.inputPort.read() as string;
            const job = JSON.parse(jobJson) as IJob;
            this.ns.print(`Received Job ${job.id}`);
            this.jobQueue.enqueue(job);
        }        
    }

    private executeJob(): void {
        const job = this.jobQueue.peek() as IJob;

        const executionHostMappings = this.virtualHost.getExecutionHostMappings(job);
        for (const mapping of executionHostMappings) {
            const pid = this.ns.exec(job.action, mapping.host, mapping.threads, job.target);
            if (pid === 0) continue;
            job.processes.push({host: mapping.host, pid: pid, complete: false});
            job.executedThreads += mapping.threads;
        }

        // Only dequeue the job after all of it's threads are executing
        const remainingThreads = job.executedThreads - job.threads;
        if (remainingThreads === 0) {
            this.ns.print(`Executed Job ${job.id}`);
            this.jobsExecuted.add(job);
            this.jobQueue.dequeue();
        }
    }
}
