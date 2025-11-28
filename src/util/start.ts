import { NS } from '@ns'
import { TargetRanker } from '/lib/TargetRanker';

export async function main(ns : NS) : Promise<void> {
	const server = ns.args[0] as string || 'home';
    const ranker = new TargetRanker(ns);
	const targets = ranker.getRankedTargets();

	targets.forEach(target => {
		// ns.exec('/basic/selfHack.js', target, 1);
		ns.exec('/exec/PrepareServer.js', server, undefined, target);
	});

    ns.exec('/exec/Rooter.js', server);
	ns.exec('/util/solveContracts.js', server);
    ns.exec('/util/shareMemory.js', server);
}
