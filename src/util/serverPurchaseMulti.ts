import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    if (ns.args[0] === '-h' || ns.args[0] === 'help') {
		ns.tprint('Usage: run serverPurchaseMulti.js <prefix> <start> <number> <ramSize>');
	}

	const prefix: string = ns.args[0] as string;
	const start: number = ns.args[1] as number;
	const num: number = ns.args[2] as number;
	const serverSize: number = ns.args[3] as number;

	ns.tprint(`Purchasing ${num} servers of size '${serverSize}'`);
	for (let i = 0; i < num; i++) {
		const hostname = prefix + (start + i).toString();
		ns.purchaseServer(hostname, serverSize);
		ns.scp(['/basic/weaken.js', '/basic/grow.js', '/basic/hack.js', '/basic/farm.js'], hostname, 'home');
	}
}
