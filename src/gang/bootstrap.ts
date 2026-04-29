import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
	ns.disableLog("sleep");
	await trainingMontage(ns);
	await killingSpree(ns);
	ns.singularity.stopAction();
	// ns.spawn('gang/grow.js');
}

async function trainingMontage(ns: NS) : Promise<void> {
	if (ns.singularity.getCrimeChance('Homicide') >= 1) {
		ns.print('SUCCESS: Already Trained!');
		return;
	}

	while(ns.singularity.getCrimeChance('Homicide') < 1) {
		let originalSkillLevel = ns.getPlayer().skills.strength;
		if (ns.singularity.gymWorkout('Powerhouse Gym', 'str', false)) {
			for (;ns.getPlayer().skills.strength < (originalSkillLevel + 5);) {
				await ns.sleep(100);
				if (ns.singularity.getCrimeChance('Homicide') >= 1) {
					ns.print('SUCCESS: Completed Training!');
					return;
				}
			}
		} else {
			ns.print("ERROR: Failed to start workout.");
		}

		originalSkillLevel = ns.getPlayer().skills.defense;
		if (ns.singularity.gymWorkout('Powerhouse Gym', 'def', false)) {
			for (;ns.getPlayer().skills.defense < (originalSkillLevel + 5);) {
				await ns.sleep(100);
				if (ns.singularity.getCrimeChance('Homicide') >= 1) {
					ns.print('SUCCESS: Completed training!');
					return;
				}
			}
		} else {
			ns.print("ERROR: Failed to start workout.");
		}

		originalSkillLevel = ns.getPlayer().skills.dexterity;
		if (ns.singularity.gymWorkout('Powerhouse Gym', 'dex', false)) {
			for (;ns.getPlayer().skills.dexterity < (originalSkillLevel + 5);) {
				await ns.sleep(100);
				if (ns.singularity.getCrimeChance('Homicide') >= 1) {
					ns.print('SUCCESS: Completed Training!');
					return;
				}
			}
		} else {
			ns.print("ERROR: Failed to start workout.");
		}

		originalSkillLevel = ns.getPlayer().skills.agility;
		if (ns.singularity.gymWorkout('Powerhouse Gym', 'agi', false)) {
			for (;ns.getPlayer().skills.agility < (originalSkillLevel + 5);) {
				await ns.sleep(100);
				if (ns.singularity.getCrimeChance('Homicide') >= 1) {
					ns.print('SUCCESS: Completed Training!');
					return;
				}
			}
		} else {
			ns.print("ERROR: Failed to start workout.");
		}
	}

	ns.print('SUCCESS: Completed Training!');
}

async function killingSpree(ns: NS): Promise<void> {
	if (ns.gang.inGang()) {
		ns.print('SUCCESS: Already in Gang!');
		return;
	}

	ns.singularity.commitCrime('Homicide', false);
	while(true) {
		if (ns.singularity.checkFactionInvitations().includes('Slum Snakes')) {
			ns.singularity.joinFaction('Slum Snakes');
		}
		if (ns.getPlayer().karma <= -54000 && ns.singularity.checkFactionInvitations().includes('Slum Snakes') && ns.gang.createGang('Slum Snakes')) {
			ns.print('SUCCESS: Created Gang!');
			return;
		}
		await ns.sleep(1000);
	}
}