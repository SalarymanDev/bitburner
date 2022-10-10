import { NS } from '@ns'

export class NetworkScanner {
    private network: string[];
    private rootedNetwork: string[];

    constructor(private ns: NS) {
        this.network = this.scan();
        this.rootedNetwork = this.network.filter(host => this.ns.hasRootAccess(host));
        this.ns.disableLog('ALL');
    }

    public getNetwork(): string[] {
        return this.network;
    }

    public getRootedNetwork(): string[] {
        return this.rootedNetwork;
    }

    public getRootedNetworkMinusHome(): string[] {
        return this.rootedNetwork.filter(host => host != 'home');
    }

    public getNonPurchasedRootedNetwork(): string[] {
        const purchasedServers = this.ns.getPurchasedServers();
        return this.rootedNetwork.filter(host => !purchasedServers.includes(host));
    }

    public getPurchasedNetwork(): string[] {
        return this.ns.getPurchasedServers();
    }

    public update(): void {
        this.network = this.scan();
        this.rootedNetwork = this.network.filter(host => this.ns.hasRootAccess(host));
    }

    public print(host = 'home', depth = 0, visited: Set<string> = new Set<string>()): void {
        const depthString = new Array((depth) + 1).join('.');
        this.ns.tprint(`${depthString}${host}`)
        visited.add(host);
        for (const neighbor of this.ns.scan(host)) {
            if (!visited.has(neighbor)) {
                this.print(neighbor, depth + 1, visited);
            }
        }
    }

    public scan(host = 'home', depth = 0, visited: Set<string> = new Set<string>()): string[] {
        visited.add(host);
        for (const neighbor of this.ns.scan(host)) {
            if (!visited.has(neighbor)) {
                 this.scan(neighbor, depth + 1, visited);
            }
        }
        return [...visited];
    }
}