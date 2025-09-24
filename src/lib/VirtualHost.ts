import { NS } from '@ns'
import { IJob } from '/lib/Job';
import { Job, JobAction } from '/lib/Job';

export class VirtualHost {
    constructor(private ns: NS, private hosts: string[]) {
        this.hosts = this.hosts.sort((previous, current) => ns.getServerMaxRam(current) - ns.getServerMaxRam(previous));
    }

    public getMaxMemory(): number {
        return this.hosts
            .map(host => this.ns.getServerMaxRam(host))
            .reduce((previous, current) => previous + current);
    }

    public getAvailableMemory(): number {
        return this.hosts
            .map(host => this.ns.getServerMaxRam(host) - this.ns.getServerUsedRam(host))
            .reduce((previous, current) => previous + current);
    }

    public async exec(job: IJob): Promise<void> {
        const executionHostMappings = this.getExecutionHostMappings(job);
        for (const mapping of executionHostMappings) {
            const pid = job.target ?
                this.ns.exec(job.action, mapping.host, mapping.threads, job.target) :
                this.ns.exec(job.action, mapping.host, mapping.threads);
            if (pid === 0) {
                this.ns.tprint(`Failed to execute ${job.action} on ${mapping.host}`);
                continue;
            }
            job.processes.push({host: mapping.host, pid: pid, complete: false});
            job.executedThreads += mapping.threads;
        }
    }

    public async share(): Promise<void> {
        const job = new Job(undefined, JobAction.Share, 1);
        const memoryPerThread = job.actionRamUsage;
        const availableMemory = this.getAvailableMemory();
        const maxThreads = Math.floor(availableMemory / memoryPerThread);
        if (maxThreads === 0) {
            this.ns.tprint('No available memory to share');
            return;
        }

        job.threads = maxThreads;
        await this.exec(job);
        await this.ns.sleep(10000);

        while (job.processes.some(p => this.ns.isRunning(p.pid))) {
            await this.ns.sleep(500);
        }
    }

    public getExecutionHostMappings(job: IJob): HostThreadMapping[] {
        let threadsToAllocate =  job.threads - job.executedThreads;

        // Check if a host can handle the entire job.
        for (const host of this.hosts) {
            if (threadsToAllocate === 0) break;

            const availableRam = this.ns.getServerMaxRam(host) - this.ns.getServerUsedRam(host);
            const maxThreads = Math.floor(availableRam / job.actionRamUsage);

            if (threadsToAllocate > maxThreads) continue;

            return [{host: host, threads: threadsToAllocate}];
        }

        
        const mappings: HostThreadMapping[] = [];
        // Split job amongst hosts if necessaary
        for (const host of this.hosts) {
            if (threadsToAllocate === 0) break;
            const alreadyRunning = job.target ? this.ns.isRunning(job.action, host, job.target) : this.ns.isRunning(job.action, host);
            if (alreadyRunning) continue;

            const availableRam = this.ns.getServerMaxRam(host) - this.ns.getServerUsedRam(host);
            const maxThreads = Math.floor(availableRam / job.actionRamUsage);
            const threads = Math.min(threadsToAllocate, maxThreads);

            if (threads === 0) continue;
            
            mappings.push({host, threads});
            threadsToAllocate = threadsToAllocate - threads;
        }

        return mappings;
    }
}

export interface HostThreadMapping {
    host: string,
    threads: number
}