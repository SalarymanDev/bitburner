import { NS } from '@ns'
import { TargetRanker } from '/lib/TargetRanker'

export async function main(ns : NS) : Promise<void> {
	const ranker = new TargetRanker(ns);
	const rankedTargets = ranker.getRankedTargets();
	rankedTargets.forEach(target => ns.tprint(target));
}