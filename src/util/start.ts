import { NS } from '@ns'
import { TargetRanker } from '/lib/TargetRanker';

export async function main(ns : NS) : Promise<void> {
    ns.exec('/util/deployCode.js', 'home');
    ns.exec('/exec/Rooter.js', 'home');

    const ranker = new TargetRanker(ns);
	const targets = ranker.getRankedTargets();
	const pids = [];

	targets.forEach(target => {
		pids.push(ns.exec('/exec/PrepareServer.js', 'home', undefined, target));
	});
}
