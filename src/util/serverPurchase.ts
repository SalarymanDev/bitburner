import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    if (ns.args[0] === '-h' || ns.args[0] === 'help') {
		ns.tprint('Usage: run serverPurchase.js <hostname> <ramSize>');
	}

	const hostname: string = ns.args[0] as string;
	const serverSize: number = ns.args[1] as number;
	ns.tprint(`Purchasing server of size '${serverSize}' and hostname '${hostname}'`);
	if (ns.purchaseServer(hostname, serverSize) === hostname) {
		ns.scp(['/basic/weaken.js', '/basic/grow.js', '/basic/hack.js', '/basic/farm.js'], hostname, 'home');
	} else {
		ns.tprint('Failed to purchase server!');
	}
}
