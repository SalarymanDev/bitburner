import { NS } from '@ns'
import { VirtualHost } from '/lib/VirtualHost'
import { NetworkScanner } from '/lib/NetworkScanner';

export async function main(ns : NS) : Promise<void> {
	const additionalHosts = ns.args as string[];
	const network = new NetworkScanner(ns);
	while (true) {
		network.update();
		const sharableHosts = new Set(network.getRootedNetwork().filter(host => host !== 'home' && !host.includes('hacknet-server-')).concat(additionalHosts));
		const virtualHost = new VirtualHost(ns, Array.from(sharableHosts));
		await virtualHost.share();
	}
}