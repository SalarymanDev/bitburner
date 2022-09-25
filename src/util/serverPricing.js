/** @param {NS} ns */
export async function main(ns) {
	if (ns.args[0] === '-h' || ns.args[0] === 'help') {
		ns.tprint('Usage: run serverPricing.js <ramSize>');
	}

	const serverSize = ns.args[0];
	const serverCost = ns.getPurchasedServerCost(serverSize);
	ns.tprint(`Server of size ${serverSize} costs \$${serverCost}`);
}