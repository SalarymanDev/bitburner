import { NS } from '@ns'
import { NetworkScanner } from '/lib/NetworkScanner'

export async function main(ns : NS) : Promise<void> {
    const scanner = new NetworkScanner(ns);
    const farmScript = '/basic/farm.js';
    const scriptRam = ns.getScriptRam(farmScript, 'home');

    const hosts = scanner.getRootedNetwork()
        .filter(host => ns.getServerMaxRam(host) > scriptRam);

    for (const host of hosts) {
        const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
        const threads = Math.floor(availableRam / scriptRam);

        if (threads === 0) continue;

        if (!ns.fileExists(farmScript, host)) {
            await ns.scp(farmScript, host, 'home');
        }

        ns.tprint(`Farming on ${host} with ${threads} threads!`)
        ns.exec(farmScript, host, threads);
    }
}