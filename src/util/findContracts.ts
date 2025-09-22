import { NS } from '@ns'
import { NetworkScanner } from '/lib/NetworkScanner';

export async function main(ns : NS) : Promise<void> {
	const scanner = new NetworkScanner(ns);
    const network = [...scanner.getNetwork()];
	for (const host of network) {
		const contracts = ns.ls(host, '.cct');
		if (contracts.length > 0) {
			ns.tprint(`Found contracts on ${host}: ${contracts.join(', ')}`);
		}
	}
}