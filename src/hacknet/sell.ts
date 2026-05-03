import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
	ns.disableLog('ALL');
	while(true) {
		if (ns.hacknet.numHashes() > 4) {
			ns.hacknet.spendHashes('Sell for Money', undefined, Math.floor(ns.hacknet.numHashes() / 4));
		}
		await ns.sleep(100);
	}
}