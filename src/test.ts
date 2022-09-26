import { NS } from '@ns'
import { TargetRanker } from '/lib/TargetRanker';

export async function main(ns : NS) : Promise<void> {
    const ranker = new TargetRanker(ns);
    ns.tprint(`Ranked Targets: ${ranker.getRankedTargets()}`);
}
