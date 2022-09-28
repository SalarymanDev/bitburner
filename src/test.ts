import { NS } from '@ns'
import { NetworkScanner } from '/lib/NetworkScanner';
import { VirtualHost } from '/lib/VirtualHost'
// import { TargetRanker } from '/lib/TargetRanker';

export async function main(ns : NS) : Promise<void> {
    // const ranker = new TargetRanker(ns);
    // const rankedTargets = ranker.getRankedTargets();
    // rankedTargets.forEach(target => {
    //     ns.tprint(target);
    //     ns.tprint(ns.getServerMaxMoney(target));
    //     ns.tprint('===========');
    // });

    const virtualHost = new VirtualHost(ns, new NetworkScanner(ns).getRootedNetwork());
}
