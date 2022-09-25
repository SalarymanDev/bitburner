/** @param {NS} ns */
import { Queue } from '/lib/Queue';

export class ServerManager {
	constructor(ns) {
		this.ns = ns;
	}

	async scanHosts() {
		const seenHosts = new Set();
		const hostsToScan = new Queue();
		hostsToScan.enqueue(this.ns.getHostname());

		while(!hostsToScan.isEmpty) {
			const currentHost = hostsToScan.dequeue();
			const newHosts = this.ns.scan(currentHost)
									.filter(host => !seenHosts.has(host));
			newHosts.forEach(host => hostsToScan.enqueue(host));
			newHosts.forEach(host => seenHosts.add(host));
		}

		this.ns.tprint(`Visited Hosts: ${Array.from(seenHosts)}`);

		const rootedHosts = [];

		for (const host of seenHosts.values()) {
			if (this.ns.hasRootAccess(host)) {
				rootedHosts.push(host);
			}
		}

		this.ns.tprint(`Rooted Hosts: ${rootedHosts}`);
		this.rootedHosts = rootedHosts;
	}
}