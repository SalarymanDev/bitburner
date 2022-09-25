import { NS } from '@ns';
import { Queue } from '/lib/Queue';

export class ServerManager {
    private rootedHosts: string[] = [];

    constructor(private ns: NS) {}

    public async scanHosts(): Promise<void> {
        const seenHosts = new Set<string>();
		const hostsToScan = new Queue<string>();
		hostsToScan.enqueue(this.ns.getHostname());

		while(!hostsToScan.isEmpty()) {
			const currentHost: string = hostsToScan.dequeue() ?? '';
			const newHosts = this.ns.scan(currentHost)
									.filter(host => !seenHosts.has(host));
			newHosts.forEach(host => hostsToScan.enqueue(host));
			newHosts.forEach(host => seenHosts.add(host));
		}

		this.ns.tprint(`Visited Hosts: ${Array.from(seenHosts)}`);

		const rootedHosts: string[] = [];

		for (const host of seenHosts.values()) {
			if (this.ns.hasRootAccess(host)) {
				rootedHosts.push(host);
			}
		}

		this.ns.tprint(`Rooted Hosts: ${rootedHosts}`);
		this.rootedHosts = rootedHosts;
    }
}