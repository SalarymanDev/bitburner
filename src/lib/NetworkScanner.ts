import { NS } from '@ns'
import { Queue } from '/lib/Queue';

export class NetworkScanner {
    private network: Set<string>;
    private rootedNetwork: Set<string>;

    constructor(private ns: NS) {
        this.network = this.scanAll();
        this.rootedNetwork = new Set<string>([...this.network].filter(host => this.ns.hasRootAccess(host)));
    }

    public getNetwork(): Set<string> {
        return this.network;
    }

    public getRootedNetwork(): Set<string> {
        return this.rootedNetwork;
    }

    private scanAll(): Set<string> {
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

        return seenHosts;
    }
}