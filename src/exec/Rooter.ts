import { NS } from '@ns'
import { NetworkScanner } from '/lib/NetworkScanner';

export async function main(ns : NS) : Promise<void> {
    ns.disableLog('ALL');

    while(true) {
        const scanner = new NetworkScanner(ns);
        const hosts = scanner.getNetwork();
        const hackingLevel = ns.getHackingLevel();

        for (const host of hosts) {
            const files = ns.ls('home', '.js');
            ns.scp(files, host, 'home');
            if (hackingLevel < ns.getServerRequiredHackingLevel(host)) continue;
            if (ns.hasRootAccess(host)) continue;

            const requiredPorts = ns.getServerNumPortsRequired(host);
            let portsOpen = 0;

            if (ns.fileExists('BruteSSH.exe')) {
                ns.brutessh(host);
                portsOpen++;
            }
            if (ns.fileExists('FTPCrack.exe')) {
                ns.ftpcrack(host);
                portsOpen++;
            }
            if (ns.fileExists('relaySMTP.exe')) {
                ns.relaysmtp(host);
                portsOpen++;
            }
            if (ns.fileExists('HTTPWorm.exe')) {
                ns.httpworm(host);
                portsOpen++;
            }
            if (ns.fileExists('SQLInject.exe')) {
                ns.sqlinject(host);
                portsOpen++;
            }
            if (ns.fileExists('NUKE.exe') && portsOpen >= requiredPorts) {
                ns.nuke(host);
                ns.print(`Rooted: ${host}`);
                ns.exec('/exec/PrepareServer.js', 'home', undefined, host);
            }
        }

        await ns.sleep(1000);
    }
    
}