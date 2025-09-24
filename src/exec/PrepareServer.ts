import { NS } from '@ns'
import { JobAction } from '/lib/Job';

export async function main(ns : NS) : Promise<void> {
	const target = ns.args[0] as string;
	const player = ns.getPlayer();
	const server = ns.getServer('home');
	
	await breakSecurity(ns, target, server, player);
	await growMoney(ns, target, server, player);
	ns.tprint(`Server Preperation Complete for ${target}!`);
}

async function growMoney(ns: NS, target: string, server: Server, player: Player): Promise<void> {
	const maxMoney = ns.getServerMaxMoney(target);
	let currentMoney = ns.getServerMoneyAvailable(target);

	if (currentMoney === maxMoney) {
		return;
	}

	while (currentMoney < maxMoney) {
		const growthThreadsNeeded = ns.formulas.hacking.growThreads(ns.getServer(target), ns.getPlayer(), maxMoney, server.cpuCores);
		const growTime = ns.formulas.hacking.growTime(server, player);
		const growSecurityIncrease = ns.growthAnalyzeSecurity(growthThreadsNeeded, target, server.cpuCores);

		const weakenTime = ns.formulas.hacking.weakenTime(server, player);
		const weakenThreadsNeededForGrow = Math.ceil(growSecurityIncrease / 0.05);
		ns.weakenAnalyze(weakenThreadsNeededForGrow, server.cpuCores);
		

		const growWeakenEnd = weakenTime;
		const growEnd = growWeakenEnd - 500;
		const growSleep = growEnd - growTime;

		const weakenPid = ns.exec(JobAction.Weaken, server.hostname, weakenThreadsNeededForGrow, target);
		await ns.sleep(growSleep);
		const growPid = ns.exec(JobAction.Grow, server.hostname, growthThreadsNeeded, target);
		await ns.sleep(growTime + 100);

		while (ns.isRunning(growPid, server.hostname) || ns.isRunning(weakenPid, server.hostname)) {
			await ns.sleep(500);
		}

		currentMoney = ns.getServerMoneyAvailable(target);
	}
	
}

async function breakSecurity(ns: NS, target: string, server: Server, player: Player): Promise<void> {
	let currentSecurityLevel = ns.getServerSecurityLevel(target);
	const minSecurityLevel = ns.getServerMinSecurityLevel(target);

	if (currentSecurityLevel === minSecurityLevel) {
		return;
	}

	while (currentSecurityLevel > minSecurityLevel) {
		const weakenThreadsNeeded = Math.ceil((currentSecurityLevel - minSecurityLevel) / 0.05);

		const weakenTime = ns.formulas.hacking.weakenTime(server, player);
		const weakenPid = ns.exec(JobAction.Weaken, server.hostname, weakenThreadsNeeded, target);
		await ns.sleep(weakenTime + 100);

		while (ns.isRunning(weakenPid, server.hostname)) {
			await ns.sleep(500);
		}
		
		currentSecurityLevel = ns.getServerSecurityLevel(target);
	}
}