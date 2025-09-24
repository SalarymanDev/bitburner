import { NS } from '@ns'
import { VirtualHost } from '/lib/VirtualHost'
import { NetworkScanner } from '/lib/NetworkScanner';

export async function main(ns : NS) : Promise<void> {
	const additionalHosts = ns.args as string[];
	const network = new NetworkScanner(ns);
	const sharableHosts = new Set(network.getNonPurchasedRootedNetwork().filter(host => host !== 'home').concat(additionalHosts));
	const virtualHost = new VirtualHost(ns, Array.from(sharableHosts));
	while (true) {
		await virtualHost.share();
	}
}