import { NS } from '@ns'

const ascendTheshold = 1.1;


export async function main(ns : NS) : Promise<void> {
	ns.disableLog('ALL');

	if (!ns.gang.inGang()) {
		ns.print("You're not in a gang yet!");
		return;
	}


	while(true) {
		const gangMembers = ns.gang.getMemberNames();

		for (const member of gangMembers) {
			const info = ns.gang.getMemberInformation(member);
			const ascResult = ns.gang.getAscensionResult(member);
			let newTask = 'Train Hacking';
			
			if (!ascResult) {
				ns.gang.setMemberTask(member, newTask);
				continue;
			}
			
			if (ascResult.hack < ascendTheshold) {
				newTask = 'Train Hacking';
			} else if (ascResult.str < ascendTheshold || ascResult.def < ascendTheshold || ascResult.agi < ascendTheshold || ascResult.dex < ascendTheshold) {
				newTask = 'Train Combat';
			} else if (ascResult.cha < ascendTheshold) {
				newTask = 'Train Charisma';
			} else {
				ns.gang.ascendMember(member);
				ns.print(`Ascending ${member}`);
			}

			if (info.task !== newTask) {
				ns.print(`Assigning ${member} to ${newTask}`);
				ns.gang.setMemberTask(member, newTask);
			}
		}

		await ns.sleep(5000);
	}
}