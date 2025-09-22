import { NS } from '@ns'
import { NetworkScanner } from '/lib/NetworkScanner';
import { TargetRanker } from '/lib/TargetRanker';

class Work {
	public pid: number = undefined;
	public target: string = undefined;

	constructor(pid: number, target: string) {
		this.pid = pid;
		this.target = target;
	}
}

export async function main(ns : NS) : Promise<void> {
	const assignedTargets = new Set<string>();
	const workMap = new Map<string, Work>();
	const network = new NetworkScanner(ns);

	while (true) {
		const workers = network.getPurchasedNetwork().filter(worker => worker.includes('worker'));
		const hackingTargets = new TargetRanker(ns).getRankedTargets().filter(target => {
			const atMaxMoney = ns.getServerMaxMoney(target) === ns.getServerMoneyAvailable(target);
			const atMinSecurity = ns.getServerMinSecurityLevel(target) === ns.getServerSecurityLevel(target);
			return atMaxMoney && atMinSecurity;
		});

		// Assign work to unused workers
		for (const target of hackingTargets) {
			if (assignedTargets.has(target)) {
				continue;
			}

			for (const worker of workers) {
				if (workMap.has(worker)) {
					continue;
				}

				assignedTargets.add(target);
				const pid = ns.exec('/exec/BatchHackDynamic.js', worker, undefined, target);
				workMap.set(worker, new Work(pid, target));
				break;
			}
		}

		// Check if any existing processes failed and restart them
		workMap.entries().forEach(([worker, work]) => {
			if (!ns.isRunning(work.pid, worker)) {
				const pid = ns.exec('/exec/BatchHackDynamic.js', worker, undefined, target);
				work.pid = pid;
				workMap.set(worker, work);
			}
		});

		await ns.sleep(500);
	}
}