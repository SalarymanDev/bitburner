/** @param {NS} ns */
export async function main(ns) {
    if (ns.args[0] === '-h' || ns.args[0] === 'help') {
		ns.tprint('Usage: run serverPurchase.js <hostname> <ramSize>');
	}

	const hostname = ns.args[0];
	const serverSize = ns.args[1];
	ns.tprint(`Purchasing server of size '${serverSize}' and hostname '${hostname}'`);
	ns.purchaseServer(hostname, serverSize);
}