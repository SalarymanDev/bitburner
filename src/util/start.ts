import { NS } from '@ns'
import { NetworkScanner } from '/lib/NetworkScanner';
import { TargetRanker } from '/lib/TargetRanker';

export async function main(ns : NS) : Promise<void> {
    const network = new NetworkScanner(ns);
    const workers = network.getPurchasedNetwork().filter(worker => worker.includes('worker'));
    const hackingTargets = new TargetRanker(ns).getRankedTargets().filter(target => {
        const atMaxMoney = ns.getServerMaxMoney(target) === ns.getServerMoneyAvailable(target);
        const atMinSecurity = ns.getServerMinSecurityLevel(target) === ns.getServerSecurityLevel(target);
        return atMaxMoney && atMinSecurity;
    });

    ns.exec('/exec/Rooter.js', 'home');
    ns.exec('/util/crackServers.js', 'home');

    const deployPid = ns.exec('/util/deployCode.js', 'home');
    while (ns.isRunning(deployPid)) {
        await ns.sleep(25);
    }
    
    for (let i = 0; i < workers.length && i < hackingTargets.length; ++i) {
        ns.exec('/exec/BatchHackDynamic.js', workers[i], undefined, hackingTargets[i]);
    }

    // const includeHome = ns.args.includes('--home');
    // ns.exec('/exec/JobSchedulerBin.js', 'home');
    // ns.exec('/exec/JobExecutorBin.js', 'home', undefined, includeHome ? '--home' : '');
}
