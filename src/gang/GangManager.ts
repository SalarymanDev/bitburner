import { NS } from '@ns'

const ascendTheshold = 1.1;

export async function main(ns : NS) : Promise<void> {
	if (!ns.gang.inGang()) {
		ns.print("You're not in a gang yet!");
		return;
	}
	ns.disableLog('ALL');

	const memberTasks = new Map();
	for (const member of ns.gang.getMemberNames()) {
		memberTasks.set(member, ns.gang.getMemberInformation(member).task);
	}

	while(true) {
		const power = ns.gang.getOtherGangInformation()['Tetrads'].power;
		let tickTime = null;
		while(true) {
			const newPower = ns.gang.getOtherGangInformation()['Tetrads'].power;
			if (power !== newPower) {
				tickTime = Date.now();
				break;
			}
			await ns.sleep(1);
		}

		ns.print('Returning to work...');
		const gangMembers = ns.gang.getMemberNames();
		for (const member of gangMembers) {
			const ascResult = ns.gang.getAscensionResult(member);
			if (ascResult && ascResult.str >= ascendTheshold && ascResult.def >= ascendTheshold && ascResult.agi >= ascendTheshold && ascResult.dex >= ascendTheshold) {
				ns.gang.ascendMember(member);
				ns.print(`Ascending ${member}`);
			}

			if (memberTasks.has(member)) {
				ns.gang.setMemberTask(member, memberTasks.get(member));
			} else {
				ns.gang.setMemberTask(member, 'Train Combat');
			}
		}

		while(Date.now() < tickTime + 19500) {
			await ns.sleep(50);
		}

		ns.print('Time for War!');
		for (const member of gangMembers) {
			memberTasks.set(member, ns.gang.getMemberInformation(member).task)
			ns.gang.setMemberTask(member, 'Territory Warfare');
		}
	}
}