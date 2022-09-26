import { NS } from '@ns';
import { NetworkScanner } from '/lib/NetworkScanner';


export async function main(ns : NS) : Promise<void> {
    const scanner = new NetworkScanner(ns);
    const network = [...scanner.getNetwork()];
    for (const host of network) {
        const maxMoney = ns.getServerMaxMoney(host);
        const minSecurity = ns.getServerMinSecurityLevel(host);
        const growthRate = ns.getServerGrowth(host);
        const weakenTime = ns.getWeakenTime(host);
        const growTime = ns.getGrowTime(host);
        const hackTime = ns.getHackTime(host);

        if (maxMoney === 0) continue;
        if (ns.getServerRequiredHackingLevel(host) > ns.getHackingLevel()) continue;

        ns.tprint(`${host}`);
        ns.tprint(`Max Money: ${maxMoney / 1000000}M`);
        ns.tprint(`Min Security: ${minSecurity}`);
        ns.tprint(`Growth Rate: ${growthRate}`);
        ns.tprint(`Weaken Time: ${Math.ceil(weakenTime / 1000)}s`);
        ns.tprint(`Grow Time: ${Math.ceil(growTime / 1000)}s`);
        ns.tprint(`Hack Time: ${Math.ceil(hackTime / 1000)}s`);
        ns.tprint('========================');
    }
}
