import { NS } from '@ns'
import { IJob } from '/lib/Job';

export class VirtualHost {
    constructor(private ns: NS, private hosts: string[]) {
        this.hosts = this.hosts.sort((previous, current) => ns.getServerMaxRam(current) - ns.getServerMaxRam(previous));
    }

    public getAvailableRam(): number {
        return this.hosts.map(host => this.ns.getServerMaxRam(host) - this.ns.getServerUsedRam(host))
                         .reduce((previous, current) => previous + current);
    }

    public getExecutionHostMappings(job: IJob): HostThreadMapping[] {
        const mappings: HostThreadMapping[] = [];
        let threadsToAllocate =  job.threads - job.executedThreads;

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