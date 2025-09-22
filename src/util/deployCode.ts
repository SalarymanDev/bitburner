import { NS } from '@ns'
import { NetworkScanner } from '/lib/NetworkScanner';

export async function main(ns : NS) : Promise<void> {
	const botnet = new NetworkScanner(ns);
	const bots = botnet.getRootedNetworkMinusHome();

	const files = ns.ls('home', '.js');
	bots.forEach(bot => {
		ns.scp(files, bot, 'home');
	});
}