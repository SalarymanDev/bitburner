import { NS } from '@ns'
import { BatchJob } from '/lib/BatchJob';
import { JobAction } from '/lib/Job';

function getHackTime(ns: NS, target: string, server: Server, player: Player): number {
	if (ns.fileExists('Formulas.exe', 'home')) {
		return ns.formulas.hacking.hackTime(server, player);
	}
	return ns.getHackTime(target);
}

function getGrowTime(ns: NS, target: string, server: Server, player: Player): number {
	if (ns.fileExists('Formulas.exe', 'home')) {
		return ns.formulas.hacking.growTime(server, player);
	}
	return ns.getGrowTime(target);
}

function getWeakenTime(ns: NS, target: string, server: Server, player: Player): number {
	if (ns.fileExists('Formulas.exe', 'home')) {
		return ns.formulas.hacking.weakenTime(server, player);
	}
	return ns.getWeakenTime(target);
}

export async function main(ns : NS) : Promise<void> {
	const target = ns.args[0] as string;
	const host = ns.getHostname();
	const server = ns.getServer(host);
	const player = ns.getPlayer();
	const minsSecurityLevel = ns.getServerMinSecurityLevel(target);
	const maxMoney = ns.getServerMaxMoney(target);
	const maxMemory = ns.getServerMaxRam(host);

	while (true) {
		let amountToHack = (maxMoney / 2) + 10000;

		let hackTime = 0;
		let growTime = 0;
		let weakenTime = 0;
		let hackThreadsNeeded = 0;
		let hackSecurityIncrease = 0;
		let growthThreadsNeeded = 0;
		let growSecurityIncrease = 0;
		let weakenThreadsNeededForHack = 0;
		let weakenThreadsNeededForGrow = 0;

		const availableMemory = (maxMemory - ns.getServerUsedRam(host)) * 0.9;
		let totalMemoryNeeded = Infinity;

		let canProceed = false;
		while (totalMemoryNeeded > availableMemory && amountToHack > 0) {
			amountToHack -= 10000;

			hackTime = getHackTime(ns, target, server, player);
			growTime = getGrowTime(ns, target, server, player);
			weakenTime = getWeakenTime(ns, target, server, player);
			hackThreadsNeeded = Math.ceil(ns.hackAnalyzeThreads(target, amountToHack));
			if (isNaN(hackThreadsNeeded) || hackThreadsNeeded === Infinity) hackThreadsNeeded = 0;
			hackSecurityIncrease = hackThreadsNeeded * 0.002;
			const growthFactor = maxMoney / (maxMoney - amountToHack);
			if (isNaN(growthFactor) || growthFactor === Infinity) {
				growthThreadsNeeded = 0;
			} else {
				growthThreadsNeeded = Math.ceil(ns.growthAnalyze(target, growthFactor + 0.01));
			}
			if (isNaN(growthThreadsNeeded) || growthThreadsNeeded === Infinity) growthThreadsNeeded = 0;
			growSecurityIncrease = ns.growthAnalyzeSecurity(growthThreadsNeeded);
			weakenThreadsNeededForHack = Math.ceil(hackSecurityIncrease / 0.05);
			weakenThreadsNeededForGrow = Math.ceil(growSecurityIncrease / 0.05);

			const weakenMemoryPerThread = 1.75;
			const growMemoryPerThread = 1.75;
			const hackMemoryPerThread = 1.70;

			totalMemoryNeeded = (hackThreadsNeeded * hackMemoryPerThread) + (weakenThreadsNeededForHack * weakenMemoryPerThread) + (growthThreadsNeeded * growMemoryPerThread) + (weakenThreadsNeededForGrow * weakenMemoryPerThread);
			if (totalMemoryNeeded < availableMemory && hackThreadsNeeded > 0 && growthThreadsNeeded > 0 && weakenThreadsNeededForHack > 0 && weakenThreadsNeededForGrow > 0) {
				ns.print(`Proceeding with batch hack on ${target}.\nAmount able to hack ${amountToHack}.\nWith threads: Hack ${hackThreadsNeeded}, Hack Weaken ${weakenThreadsNeededForHack}, Grow ${growthThreadsNeeded}, Grow Weaken ${weakenThreadsNeededForGrow}.\nTotal Memory Needed: ${totalMemoryNeeded.toFixed(2)}GB, Available: ${availableMemory.toFixed(2)}GB.`);
				canProceed = true;
				break;
			}
		}

		if (!canProceed) {
			// Wait until enough memory is available
			ns.print(`Amount unable to hack ${amountToHack}.\nWith threads: Hack ${hackThreadsNeeded}, Hack Weaken ${weakenThreadsNeededForHack}, Grow ${growthThreadsNeeded}, Grow Weaken ${weakenThreadsNeededForGrow}.\nTotal Memory Needed: ${totalMemoryNeeded.toFixed(2)}GB, Available: ${availableMemory.toFixed(2)}GB.`);
			await ns.sleep(1000);
			continue;
		}

		const batchJob = new BatchJob(target);
		batchJob.hack.threads = hackThreadsNeeded;
		batchJob.hack.duration = hackTime;
		batchJob.hackWeaken.threads = weakenThreadsNeededForHack;
		batchJob.hackWeaken.duration = weakenTime;
		batchJob.grow.threads = growthThreadsNeeded;
		batchJob.grow.duration = growTime;
		batchJob.growWeaken.threads = weakenThreadsNeededForGrow;
		batchJob.growWeaken.duration = weakenTime;

		await runBatchHack(ns, batchJob, host);

		// Post-batch verification and correction
		const currentSecurityLevel = ns.getServerSecurityLevel(target);
		const currentMoney = ns.getServerMoneyAvailable(target);

		if (currentSecurityLevel > minsSecurityLevel + 0.1) {
			const securityDiff = currentSecurityLevel - minsSecurityLevel;
			const weakenThreads = Math.ceil(securityDiff / 0.05);
			const weakenRamNeeded = weakenThreads * 1.75;
			const availableRam = (maxMemory - ns.getServerUsedRam(host)) * 0.9;
			if (weakenRamNeeded <= availableRam) {
				const weakenPid = ns.exec(JobAction.Weaken, host, weakenThreads, target);
				if (weakenPid > 0) {
					await ns.sleep(ns.getWeakenTime(target) + 100);
				}
			}
		}

		if (currentMoney < maxMoney * 0.99) {
			const growthFactor = maxMoney / currentMoney;
			const growThreads = Math.ceil(ns.growthAnalyze(target, growthFactor));
			const growRamNeeded = growThreads * 1.75;
			const availableRam = (maxMemory - ns.getServerUsedRam(host)) * 0.9;
			if (growRamNeeded <= availableRam) {
				const growPid = ns.exec(JobAction.Grow, host, growThreads, target);
				if (growPid > 0) {
					await ns.sleep(ns.getGrowTime(target) + 100);
					const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads);
					const weakenThreadsForGrow = Math.ceil(growSecurityIncrease / 0.05);
					const weakenRamNeeded2 = weakenThreadsForGrow * 1.75;
					const availableRam2 = (maxMemory - ns.getServerUsedRam(host)) * 0.9;
					if (weakenRamNeeded2 <= availableRam2) {
						const weakenPid2 = ns.exec(JobAction.Weaken, host, weakenThreadsForGrow, target);
						if (weakenPid2 > 0) {
							await ns.sleep(ns.getWeakenTime(target) + 100);
						}
					}
				}
			}
		}

		await ns.sleep(500);
	}
}

async function runBatchHack(ns: NS, job: BatchJob, host: string): Promise<void> {
	const growWeakenEnd = job.growWeaken.duration + 100;
	const growWeakenStart = growWeakenEnd - job.growWeaken.duration;
	const growEnd = growWeakenEnd - 50;
	const growStart = growEnd - job.grow.duration;
	const hackWeakenEnd = growEnd - 50;
	const hackWeakenStart = hackWeakenEnd - job.hackWeaken.duration;
	const hackEnd = hackWeakenEnd - 50;
	const hackStart = hackEnd - job.hack.duration;

	const growWeakenSleep = growWeakenStart - hackWeakenStart;
	const growSleep = growStart - growWeakenStart;
	const hackSleep = hackStart - growStart;

	const hackWeakenPid = ns.exec(job.hackWeaken.action, host, job.hackWeaken.threads, job.target);
	if (hackWeakenPid === 0) {
		ns.tprint(`Failed to exec hackWeaken on ${job.target}`);
		return;
	}
	await ns.sleep(growWeakenSleep);
	const growWeakenPid = ns.exec(job.growWeaken.action, host, job.growWeaken.threads, job.target);
	if (growWeakenPid === 0) {
		ns.tprint(`Failed to exec growWeaken on ${job.target}`);
		return;
	}
	await ns.sleep(growSleep);
	const growPid = ns.exec(job.grow.action, host, job.grow.threads, job.target);
	if (growPid === 0) {
		ns.tprint(`Failed to exec grow on ${job.target}`);
		return;
	}
	await ns.sleep(hackSleep);
	const hackPid = ns.exec(job.hack.action, host, job.hack.threads, job.target);
	if (hackPid === 0) {
		ns.tprint(`Failed to exec hack on ${job.target}`);
		return;
	}

	// Wait to complete
	while (ns.isRunning(hackWeakenPid) || ns.isRunning(growWeakenPid) || ns.isRunning(growPid) || ns.isRunning(hackPid)) {
		await ns.sleep(500);
	}
}