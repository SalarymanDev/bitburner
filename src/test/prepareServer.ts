import { NS } from '@ns'
import { VirtualHost } from '/lib/VirtualHost';
import { Job, JobAction } from '/lib/Job';
import { NetworkScanner } from '/lib/NetworkScanner';

export async function main(ns : NS) : Promise<void> {
	const target = ns.args[0] as string;
	const network = new NetworkScanner(ns);
	const servers = network.getPurchasedNetwork().filter(hostname => hostname.includes('cracker'));
	
	await breakSecurity(ns, target, servers);
	await growMoney(ns, target, servers);
	ns.tprint(`Server Preperation Complete for ${target}!`);
}

async function growMoney(ns: NS, target: string, servers: string[]): Promise<void> {
	const maxMoney = ns.getServerMaxMoney(target);
	let currentMoney = ns.getServerMoneyAvailable(target);

	if (currentMoney === maxMoney) {
		return;
	}

	while (currentMoney < maxMoney) {
		const growthThreadsNeeded = Math.ceil(ns.growthAnalyze(target, maxMoney / currentMoney));
		const growTime = ns.getGrowTime(target);
		const growSecurityIncrease = ns.growthAnalyzeSecurity(growthThreadsNeeded);

		const weakenTime = ns.getWeakenTime(target);
		const weakenThreadsNeededForGrow = Math.ceil(growSecurityIncrease / 0.05);

		const growWeakenEnd = weakenTime;
		const growEnd = growWeakenEnd - 500;
		const growSleep = growEnd - growTime;

		const virtualHost = new VirtualHost(ns, servers);
		const weakenJob = new Job(target, JobAction.Weaken, weakenThreadsNeededForGrow);
		const growJob = new Job(target, JobAction.Grow, growthThreadsNeeded);

		const weakenHosts = virtualHost.getExecutionHostMappings(weakenJob);
		for (const mapping of weakenHosts) {
			const pid = ns.exec(weakenJob.action, mapping.host, mapping.threads, weakenJob.target);
			if (pid === 0) {
				ns.tprint(`Failed to execute job on ${mapping.host}`);
				continue;
			}

			weakenJob.processes.push({host: mapping.host, pid, complete: false});
			weakenJob.executedThreads += mapping.threads;
		}
		await ns.sleep(growSleep);

		const growHosts = virtualHost.getExecutionHostMappings(growJob);
		for (const mapping of growHosts) {
			const pid = ns.exec(growJob.action, mapping.host, mapping.threads, growJob.target);
			if (pid === 0) {
				ns.tprint(`Failed to execute job on ${mapping.host}`);
				continue;
			}

			growJob.processes.push({host: mapping.host, pid, complete: false});
			growJob.executedThreads += mapping.threads;
		}

		while (growJob.processes.some(process => !process.complete)) {
			growJob.processes.filter(process => !process.complete).forEach(process => {
				process.complete = !ns.isRunning(process.pid, process.host);
			});
			await ns.sleep(100);
		}
		while (weakenJob.processes.some(process => !process.complete)) {
			weakenJob.processes.filter(process => !process.complete).forEach(process => {
				process.complete = !ns.isRunning(process.pid, process.host);
			});
			await ns.sleep(100);
		}
		currentMoney = ns.getServerMoneyAvailable(target);
	}
	
}

async function breakSecurity(ns: NS, target: string): Promise<void> {
	let currentSecurityLevel = ns.getServerSecurityLevel(target);
	const minSecurityLevel = ns.getServerMinSecurityLevel(target);

	if (currentSecurityLevel === minSecurityLevel) {
		return;
	}

	while (currentSecurityLevel > minSecurityLevel) {
		const weakenThreadsNeeded = Math.ceil((currentSecurityLevel - minSecurityLevel) / 0.05);
		const virtualHost = new VirtualHost(ns, servers);

		const job = new Job(target, JobAction.Weaken, weakenThreadsNeeded);
		const hostMappings = virtualHost.getExecutionHostMappings(job);

		for (const mapping of hostMappings) {
			const pid = ns.exec(job.action, mapping.host, mapping.threads, job.target);
			if (pid === 0) {
				ns.tprint(`Failed to execute job on ${mapping.host}`);
				continue;
			}

			job.processes.push({host: mapping.host, pid, complete: false});
			job.executedThreads += mapping.threads;
		}

		while (job.processes.some(process => !process.complete)) {
			job.processes.filter(process => !process.complete).forEach(process => {
				process.complete = !ns.isRunning(process.pid, process.host);
			});
			await ns.sleep(100);
		}
		currentSecurityLevel = ns.getServerSecurityLevel(target);
	}
}