import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
	if (!ns.gang.inGang()) {
		ns.print("You're not in a gang yet!");
		return;
	}

	const gangMembers = ns.gang.getMemberNames();

	for (const member of gangMembers) {
		ns.gang.setMemberTask(member, 'Train Hacking');
	}
}