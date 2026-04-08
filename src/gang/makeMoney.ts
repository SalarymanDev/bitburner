import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
	if (!ns.gang.inGang()) {
		ns.print("You're not in a gang yet!");
		return;
	}

	const gangMembers = ns.gang.getMemberNames();

	let lowestHackingMember = null
	for (const member of gangMembers) {
		if (!lowestHackingMember) {
			lowestHackingMember = member;
			continue;
		}

		const currentLowestHacking = ns.gang.getMemberInformation(lowestHackingMember).hack;
		const hackingLevel = ns.gang.getMemberInformation(member).hack;

		if (hackingLevel < currentLowestHacking) {
			lowestHackingMember = member;
		}
	}

	ns.gang.setMemberTask(lowestHackingMember, 'Ethical Hacking');

	const moneyLaunderers = gangMembers.filter((member) => member !== lowestHackingMember);
	for (const launderer of moneyLaunderers) {
		ns.gang.setMemberTask(launderer, 'Money Laundering');
	}
}