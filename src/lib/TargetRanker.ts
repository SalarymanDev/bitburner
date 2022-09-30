import { NS } from '@ns'
import { NetworkScanner } from '/lib/NetworkScanner';

export class TargetRanker {
    constructor(private ns: NS) {}

    public getRankedTargets(): string[] {
        const scanner = new NetworkScanner(this.ns);
        const network = [...scanner.getNetwork()];

        const hackableTargets: string[] = [];

        for (const host of network) {
            if (this.ns.getServerMaxMoney(host) === 0) continue;
            if (this.ns.getServerRequiredHackingLevel(host) > this.ns.getHackingLevel()) continue;
            if (!this.ns.hasRootAccess(host)) continue;

            hackableTargets.push(host);
        }

        return hackableTargets.sort((previous, current) => this.ns.getServerGrowth(current) - this.ns.getServerGrowth(previous));
    }
}
