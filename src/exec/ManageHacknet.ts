import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
	while(true) {
		let currentMoney = ns.getPlayer().money;

		const purchaseCost = ns.hacknet.getPurchaseNodeCost();
		if (purchaseCost < currentMoney) {
			ns.hacknet.purchaseNode();
			currentMoney = currentMoney - purchaseCost;
		}

		for (let i = 0; i < ns.hacknet.numNodes(); i++) {
			const nodeInfo = ns.hacknet.getNodeStats(i);

			if (nodeInfo.cores == 16 && nodeInfo.level == 200 && nodeInfo.ram == 64) {
				continue;
			}

			let upgradeCost = ns.hacknet.getLevelUpgradeCost(i, 1);
			if (upgradeCost < currentMoney) {
				ns.hacknet.upgradeLevel(i, 1);
				currentMoney = currentMoney - upgradeCost;
			}

			upgradeCost = ns.hacknet.getCoreUpgradeCost(i, 1);
			if (upgradeCost < currentMoney) {
				ns.hacknet.upgradeCore(i, 1);
				currentMoney = currentMoney - upgradeCost;
			}

			upgradeCost = ns.hacknet.getRamUpgradeCost(i, 1);
			if (upgradeCost < currentMoney) {
				ns.hacknet.upgradeRam(i, 1);
				currentMoney = currentMoney - upgradeCost;
			}
		}

		await ns.sleep(100);
	}
}