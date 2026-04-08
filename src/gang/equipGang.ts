import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
	if (!ns.gang.inGang()) {
		ns.print("You're not in a gang yet!");
		return;
	}

	const gangMembers = ns.gang.getMemberNames();
	const equipmentNames = ns.gang.getEquipmentNames();

	for (const member of gangMembers) {
		for (const equipmentName of equipmentNames) {
			ns.gang.purchaseEquipment(member, equipmentName);
		}
	}
}