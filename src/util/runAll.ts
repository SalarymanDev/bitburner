import { NS } from '@ns'
import { NetworkScanner } from '/lib/NetworkScanner'

export async function main(ns : NS) : Promise<void> {
    const scanner = new NetworkScanner(ns);
    const script = ns.args[0] as string;
    const scriptRam = ns.getScriptRam(script, 'home');

    const hosts = scanner.getRootedNetworkMinusHome()
        .filter(host => ns.getServerMaxRam(host) > scriptRam);

    for (const host of hosts) {
        const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
        const threads = Math.floor(availableRam / scriptRam);

        if (threads === 0) continue;

        if (!ns.fileExists(script, host)) {
            await ns.scp(script, host, 'home');
        }

        ns.tprint(`Running ${script} on ${host} with ${threads} threads!`)
        ns.exec(script, host, threads);
    }
}