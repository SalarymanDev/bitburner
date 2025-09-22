import { NS } from '@ns'
import { BatchJob } from '/lib/BatchJob';

export async function main(ns : NS) : Promise<void> {
	const target = ns.args[0] as string;
	const host = ns.getHostname();
	// const minsSecurityLevel = ns.getServerMinSecurityLevel(target);
	const maxMoney = ns.getServerMaxMoney(target);

	// const currentSecurityLevel = ns.getServerSecurityLevel(target);
	// const currentMoney = ns.getServerMoneyAvailable(target);

	

	// const totalAvailableRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home');

	// const weakenMemoryPerThread = 1.75;
	// const growMemoryPerThread = 1.75;
	// const hackMemoryPerThread = 1.70;

	// const totalMemoryNeeded = (hackThreadsNeeded * hackMemoryPerThread) + (weakenThreadsNeededForHack * weakenMemoryPerThread) + (growthThreadsNeeded * growMemoryPerThread) + (weakenThreadsNeededForGrow * weakenMemoryPerThread);

	// ns.tprint(`Total Available RAM: ${totalAvailableRam}GB`);
	// ns.tprint(`Total Memory Needed: ${totalMemoryNeeded}GB`);

	// ns.tprint(`Target: ${target}`);
	// ns.tprint(`  Current Security Level: ${currentSecurityLevel}`);
	// ns.tprint(`  Minimum Security Level: ${minsSecurityLevel}`);
	// ns.tprint(`  Current Money: $${currentMoney}`);
	// ns.tprint(`  Maximum Money: $${maxMoney}`);
	// ns.tprint(``);
	// ns.tprint(`Hack Threads Needed: ${hackThreadsNeeded}`);
	// ns.tprint(`  Hack Time: ${hackTime}ms`);
	// ns.tprint(`  Security Increase: ${hackSecurityIncrease}`);
	// ns.tprint(`Hack Weaken Threads Needed: ${weakenThreadsNeededForHack}`);
	// ns.tprint(`  Weaken Time: ${weakenTime}ms`);
	// ns.tprint(`Growth Threads Needed: ${growthThreadsNeeded}`);
	// ns.tprint(`  Grow Time: ${growTime}ms`);
	// ns.tprint(`  Security Increase: ${growSecurityIncrease}`);
	// ns.tprint(`Weaken Threads Needed: ${weakenThreadsNeededForGrow}`);
	// ns.tprint(`  Weaken Time: ${weakenTime}ms`);
	// ns.tprint(``);

	while (true) {
		const hackThreadsNeeded = Math.floor(ns.hackAnalyzeThreads(target, maxMoney / 2));
		const hackTime = ns.getHackTime(target);
		const hackSecurityIncrease = hackThreadsNeeded * 0.002;

		const growthThreadsNeeded = Math.ceil(ns.growthAnalyze(target, 2));
		const growTime = ns.getGrowTime(target);
		const growSecurityIncrease = ns.growthAnalyzeSecurity(growthThreadsNeeded);

		const weakenTime = ns.getWeakenTime(target);
		const weakenThreadsNeededForHack = Math.ceil(hackSecurityIncrease / 0.05);
		const weakenThreadsNeededForGrow = Math.ceil(growSecurityIncrease / 0.05);

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

	// ns.tprint(`Hack Weakend Start: ${hackWeakenStart}`);
	// ns.tprint(`Hack Weaken End: ${hackWeakenEnd}`);
	// ns.tprint(`Grow Weaken Start: ${growWeakenStart}`);
	// ns.tprint(`Grow Weaken End: ${growWeakenEnd}`);
	// ns.tprint(`Grow Start: ${growStart}`);
	// ns.tprint(`Grow End: ${growEnd}`);
	// ns.tprint(`Hack Start: ${hackStart}`);
	// ns.tprint(`Hack End: ${hackEnd}`);
	// ns.tprint(``);

	// const hackWeakenSleep = 0;
	const growWeakenSleep = growWeakenStart - hackWeakenStart;
	const growSleep = growStart - growWeakenStart;
	const hackSleep = hackStart - growStart;

	// ns.tprint(`hackWeakenSleep: ${hackWeakenSleep}`);
	// ns.tprint(`growWeakenSleep: ${growWeakenSleep}`);
	// ns.tprint(`growSleep: ${growSleep}`);
	// ns.tprint(`hackSleep: ${hackSleep}`);
	// ns.tprint(``);

	const hackWeakenPid = ns.exec(job.hackWeaken.action, host, job.hackWeaken.threads, job.target);
	await ns.sleep(growWeakenSleep);
	const growWeakenPid = ns.exec(job.growWeaken.action, host, job.growWeaken.threads, job.target);
	await ns.sleep(growSleep);
	const growPid = ns.exec(job.grow.action, host, job.grow.threads, job.target);
	await ns.sleep(hackSleep);
	const hackPid = ns.exec(job.hack.action, host, job.hack.threads, job.target);

	// Wait to complete
	while (ns.isRunning(hackWeakenPid) || ns.isRunning(growWeakenPid) || ns.isRunning(growPid) || ns.isRunning(hackPid)) {
		await ns.sleep(500);
	}
}