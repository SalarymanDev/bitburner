import { NS } from '@ns'
import { VirtualHost } from '/lib/VirtualHost';
import { NetworkScanner } from '/lib/NetworkScanner';

export async function main(ns : NS) : Promise<void> {
	const network = new NetworkScanner(ns);
	const bots = network.getRootedNetworkMinusHome();
	const virtualHost = new VirtualHost(ns, bots);

	ns.tprint(`Botnet:`);
	ns.tprint(` Number of Hosts: ${bots.length}`);
	ns.tprint(` Max Memory: ${virtualHost.getMaxMemory()}`);
	ns.tprint(` Available Memory: ${virtualHost.getAvailableMemory()}`);
}