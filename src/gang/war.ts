import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
	ns.disableLog("sleep");

	const gangMembers = ns.gang.getMemberNames();
	for (const member of gangMembers) {
		ns.gang.setMemberTask(member, 'Tertitory Warfare');
	}

	// Check until we can wipe the floor with the other gangs.
	while(true) {
		let canWin = true;
		
		const otherGangs = ns.gang.getOtherGangInformation();
		for (const gang in otherGangs) {
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
	ns.gang.setTerritoryWarfare(true);
	while(ns.gang.getGangInformation().territory < 1) {
		await ns.gang.nextUpdate();
	}
	ns.gang.setTerritoryWarfare(false);
	for (let i = 0; i < 1000; i++) {
		await ns.gang.nextUpdate();
	}

	ns.print('SUCCESS: All Your Base Are Belong To Us!');
	ns.spawn('gang/money.js');
}