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
        this.virtualHost = new VirtualHost(ns, this.network.getRootedNetwork());
    }
    
    public async run(): Promise<void> {
        while(true) {
            this.trackRunningJobs();
            this.outputCompletedJobIds();

            // No Jobs
            if (this.jobQueue.isEmpty() && this.inputPort.empty()) {
                this.ns.print(`No Jobs waiting...`);
                await this.ns.sleep(100);
                continue;
            }

            this.fetchJob();
            this.executeJob();

            await this.ns.sleep(10);
        }
    }

    private trackRunningJobs(): void {
        // Check if Executing Jobs Completed
        for (const job of this.jobsExecuted) {
            const runningProcesses = job.processes.filter(process => !process.complete);
            if (runningProcesses.length === 0) {
                this.completeJobs.push(job);
                continue;
            }
            runningProcesses.forEach(process => {
                process.complete = !this.ns.isRunning(process.pid, process.host);
            });
        }

        // Clean out completed jobs
        this.completeJobs.forEach(job => this.jobsExecuted.delete(job));
    }

    private outputCompletedJobIds(): void {
        if (this.outputPort.full()) return;
        if (this.completeJobs.length === 0) return;

        const completedJob = this.completeJobs.shift() as IJob;
        this.ns.print(`Sending Complete Job ${completedJob.id} to Scheduler`);
        this.outputPort.write(completedJob.id);
    }

    private updateVirtualHost(): void {
        this.network.update();
        this.virtualHost = new VirtualHost(this.ns, this.network.getRootedNetwork());
    }

    private fetchJob(): void {
        if (this.inputPort.empty()) return;

        const jobJson = this.inputPort.read() as string;
        const job = JSON.parse(jobJson) as IJob;
        this.ns.print(`Retrieved Job ${job.id} from Scheduler`);
        this.jobQueue.enqueue(job);
    }

    private executeJob(): void {
        const job = this.jobQueue.peek() as IJob;

        const executionHostMappings = this.virtualHost.getExecutionHostMappings(job);
        for (const mapping of executionHostMappings) {
            const pid = this.ns.exec(job.action, mapping.host, mapping.threads, job.target);
            job.processes.push({host: mapping.host, pid: pid, complete: false});
            job.executedThreads += mapping.threads;
        }

        // Only dequeue the job after all of it's threads are executing
        const remainingThreads = job.executedThreads - job.threads;
        if (remainingThreads === 0) {
            this.jobsExecuted.add(job);
            this.jobQueue.dequeue();
        }
    }
}
