import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    if (ns.args[0] === '-h' || ns.args[0] === 'help') {
		ns.tprint('Usage: run serverPricing.js <ramSize>');
	}

	const serverSize: number = ns.args[0] as number;
	const serverCost = ns.getPurchasedServerCost(serverSize);
	ns.tprint(`Server of size ${serverSize} costs $${serverCost}`);
}