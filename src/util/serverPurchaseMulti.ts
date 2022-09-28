import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    if (ns.args[0] === '-h' || ns.args[0] === 'help') {
		ns.tprint('Usage: run serverPurchase.js <start> <number> <ramSize>');
	}

	const start: number = ns.args[0] as number;
	const num: number = ns.args[1] as number;
	const serverSize: number = ns.args[2] as number;

	ns.tprint(`Purchasing ${num} servers of size '${serverSize}'`);
	for (let i = 0; i < num; i++) {
		const hostname = 'worker' + (start + i).toString();
		ns.purchaseServer(hostname, serverSize);
		ns.scp(['/basic/weaken.js', '/basic/grow.js', '/basic/hack.js', '/basic/farm.js'], hostname, 'home');
	}
}
