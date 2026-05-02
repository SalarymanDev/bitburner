import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
	ns.disableLog('ALL');
	while(true) {
		for (let i = 0; i < ns.hacknet.numNodes(); i++) {
			if (ns.hacknet.getLevelUpgradeCost(i) < ns.getPlayer().money) {
				ns.print(`Upgraded Node ${i} Level`);
				ns.hacknet.upgradeLevel(i);
			}
			if (ns.hacknet.getRamUpgradeCost(i) < ns.getPlayer().money) {
				ns.print(`Upgraded Node ${i} RAM`);
				ns.hacknet.upgradeRam(i);
			}
			if (ns.hacknet.getCoreUpgradeCost(i) < ns.getPlayer().money) {
				ns.print(`Upgraded Node ${i} Core`);
				ns.hacknet.upgradeCore(i);
			}
			if (ns.hacknet.getCacheUpgradeCost(i) < ns.getPlayer().money) {
				ns.print(`Upgraded Node ${i} Cache`);
				ns.hacknet.upgradeCache(i);
			}
		}
		if (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes() && ns.hacknet.getPurchaseNodeCost() < ns.getPlayer().money) {
			ns.print('Purchsed Node');
			ns.hacknet.purchaseNode();
		}

		await ns.sleep(100);
		if (ns.hacknet.numHashes() > 4) {
			ns.hacknet.spendHashes('Sell for Money', undefined, Math.floor(ns.hacknet.numHashes() / 4));
		}
	}
	
}