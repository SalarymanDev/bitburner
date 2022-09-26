import { NS } from '@ns';
import { NetworkScanner } from '/lib/NetworkScanner';

export class ServerManager {
    private rootedServers: Set<string>;
	private purchasedServers: Set<string>;
	private networkScanner: NetworkScanner;

    constructor(private ns: NS) {
		this.networkScanner = new NetworkScanner(this.ns);
        this.rootedServers = this.networkScanner.getRootedNetwork();
		this.purchasedServers = new Set<string>(this.ns.getPurchasedServers());
		this.purchasedServers.forEach(host => this.rootedServers.delete(host));
	}

	public getRootedServers(): Set<string> {
		return this.rootedServers;
	}

	public getPurchasedServers(): Set<string> {
		return this.purchasedServers;
	}
}