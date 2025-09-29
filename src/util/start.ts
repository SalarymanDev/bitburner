import { NS } from '@ns'
import { TargetRanker } from '/lib/TargetRanker';

export async function main(ns : NS) : Promise<void> {
    ns.exec('/util/deployCode.js', 'home');

    const ranker = new TargetRanker(ns);
	const targets = ranker.getRankedTargets();
	const pids = [];

	targets.forEach(target => {
		pids.push(ns.exec('/exec/PrepareServer.js', 'home', undefined, target));
	});

    ns.exec('/exec/Rooter.js', 'home');
	ns.exec('/util/solveContracts.js', 'home');
    ns.exec('/util/shareMemory.js', 'home');
}
