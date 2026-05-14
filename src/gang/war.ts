import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
	ns.disableLog("ALL");

	ns.print('Drawing up battle plans...');
	const gangMembers = ns.gang.getMemberNames();
	for (const member of gangMembers) {
		ns.gang.setMemberTask(member, 'Territory Warfare');
	}

	// Check until we can wipe the floor with the other gangs.
	while(true) {
		let canWin = true;
		
		const otherGangs = ns.gang.getAllGangInformation();
		for (const gang in otherGangs) {
			if (gang === ns.gang.getGangInformation().faction) {
				continue;
			}
			if (ns.gang.getChanceToWinClash(gang) < 0.95) {
				canWin = false;
			}
		}

		if (canWin) {
			break;
		}

		await ns.gang.nextUpdate();
	}

	// Wipe the floor with the other gangs
	ns.print('To WAR!!!');
	ns.gang.setTerritoryWarfare(true);
	while(ns.gang.getGangInformation().territory < 1) {
		await ns.gang.nextUpdate();
	}
	ns.print('Digging graves for the fallen...');
	ns.gang.setTerritoryWarfare(false);
	for (let i = 0; i < 100; i++) {
		await ns.gang.nextUpdate();
	}

	ns.print('SUCCESS: All Your Base Are Belong To Us!');
	ns.spawn('gang/money.js', {spawnDelay: 0});
}