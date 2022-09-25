import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    const target: string = ns.args[0] as string;

	const timeToWeaken = ns.getWeakenTime(target);
	const minsSecurityLevel = ns.getServerMinSecurityLevel(target);
	let currentSecurityLevel = ns.getServerSecurityLevel(target);
	const weakenScript = '/basic/weaken.js';

	ns.print(`Scheduling for host: ${target}`);
	ns.print(`Min Security: ${minsSecurityLevel}`);
	ns.print(`Current Security: ${currentSecurityLevel}`);

	if (!ns.fileExists(weakenScript, target) && currentSecurityLevel > minsSecurityLevel) {
		await ns.scp(weakenScript, target, 'home');
	}

	while(currentSecurityLevel > minsSecurityLevel) {
		const securityDiff = currentSecurityLevel - minsSecurityLevel;
		const weakensNeeded = securityDiff / 0.05;

		ns.print(`Needed weakens: ${weakensNeeded}`);

		const targetRam = ns.getServerMaxRam(target);
		const scriptRam = ns.getScriptRam(weakenScript);
		const maxThreadCount = Math.floor(targetRam / scriptRam);
		const threadCount = Math.min(weakensNeeded, maxThreadCount);

		ns.print(`Executing on ${target} with thread count ${threadCount}`);
		ns.exec(weakenScript, target, threadCount, target);

		await ns.sleep(timeToWeaken + 50);

		currentSecurityLevel = ns.getServerSecurityLevel(target);
	}

	ns.print('Weakening complete');
}