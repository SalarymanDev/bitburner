import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
	const gangMembers = ns.gang.getMemberNames();
	gangMembers.sort((a, b) => {
		return ns.gang.getMemberInformation(b).str_asc_mult - ns.gang.getMemberInformation(a).str_asc_mult;
	});

	const vigilanteAssigned = false;
	for (const member of gangMembers) {
		if (vigilanteAssigned) {
			ns.gang.setMemberTask(member, 'Human Trafficking');
		} else {
			ns.gang.setMemberTask(member, 'Vigilante Justice');
		}
	}

	ns.print('SUCCESS: Gang is Hard at Work!');
}