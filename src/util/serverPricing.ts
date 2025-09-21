import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    if (ns.args[0] === '-h' || ns.args[0] === 'help') {
		ns.tprint('Usage: run serverPricing.js <ramSize>');
		return;
	}
	const serverSize: number = ns.args[0] as number;

	if (serverSize < 0 || serverSize > 1048576 || (serverSize & (serverSize - 1)) !== 0) {
		ns.tprint('Invalid server size. Please enter a positive power of 2 number up to 1048576.');
		return;
	}

	const serverCost = ns.getPurchasedServerCost(serverSize);
	ns.tprint(`Server of size ${serverSize} costs $${serverCost}`);
}