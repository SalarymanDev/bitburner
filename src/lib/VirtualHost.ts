import { NS } from '@ns'
import { IJob } from '/lib/Job';

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
        return;
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
            if (this.ns.isRunning(job.action, host, job.target)) continue;

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