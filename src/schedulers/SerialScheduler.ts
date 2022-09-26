import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    const worker: string = ns.args[0] as string;
    const target: string = ns.args[1] as string;

    const weakenScript = '/basic/weaken.js';
    const growScript = '/basic/grow.js';
    const hackScript = '/basic/hack.js';

    if (!ns.fileExists(weakenScript, worker)) {
		await ns.scp(weakenScript, worker, 'home');
	}

    if (!ns.fileExists(growScript, worker)) {
		await ns.scp(growScript, worker, 'home');
	}

    if (!ns.fileExists(hackScript, worker)) {
		await ns.scp(hackScript, worker, 'home');
	}

    const workerMaxRam = ns.getServerMaxRam(worker);
    const workerRam = workerMaxRam - ns.getServerUsedRam(worker);

	const weakenGrowRam = ns.getScriptRam(weakenScript);
	const hackRam = ns.getScriptRam(hackScript);

    const minsSecurityLevel = ns.getServerMinSecurityLevel(target);

    const maxMoney = ns.getServerMaxMoney(target);

    const weakenGrowThreads = Math.floor(workerRam / weakenGrowRam);
    const hackThreads = Math.floor(workerRam / hackRam);

    while(true) {
        const currentSecurityLevel = ns.getServerSecurityLevel(target);
        const currentMoney = ns.getServerMoneyAvailable(target);

        if (currentSecurityLevel > (minsSecurityLevel + 10)) {
            ns.print('Weakening...')
            ns.print(`Starting Security Level: ${currentSecurityLevel}`);
            const weakensNeeded = Math.ceil((currentSecurityLevel - minsSecurityLevel) / 0.05);
            const threads = Math.min(weakensNeeded, weakenGrowThreads);
            ns.print(`Weakens Needed: ${weakensNeeded}`);
            ns.print(`Threads Being Used: ${threads}`);
            ns.exec(weakenScript, worker, threads, target);
            await ns.sleep(ns.getWeakenTime(target) + 25);
            ns.print(`Ending Security Level: ${ns.getServerSecurityLevel(target)}`);
            ns.print(`Weakening complete!`);
        } else if (currentMoney < (maxMoney * 0.75)) {
            ns.print('Growing...');
            ns.print(`Starting Money: ${currentMoney}`);
            const moneyNeeded = maxMoney - currentMoney;
            const growthsNeeded = Math.ceil(ns.growthAnalyze(target, moneyNeeded));
            const threads = Math.min(growthsNeeded, weakenGrowThreads);
            ns.print(`Growths Needed: ${growthsNeeded}`);
            ns.print(`Threads Being Used: ${threads}`);
            ns.exec(growScript, worker, threads, target);
            await ns.sleep(ns.getGrowTime(target) + 25);
            ns.print(`Ending Money: ${ns.getServerMoneyAvailable(target)}`);
            ns.print('Growing complete!');
        } else {
            ns.print('Hacking...');
            ns.print(`Starting Money: ${currentMoney}`);
            const hacksNeeded = Math.ceil(ns.hackAnalyzeThreads(target, currentMoney));
            const threads = Math.min(hacksNeeded, hackThreads);
            ns.print(`Hacks Needed: ${hacksNeeded}`);
            ns.print(`Threads Being Used: ${threads}`);
            ns.exec(hackScript, worker, threads, target);
            await ns.sleep(ns.getHackTime(target) + 25);
            const newCurrentMoney = ns.getServerMoneyAvailable(target);
            ns.print(`Ending Money: ${newCurrentMoney}`);
            ns.print(`Money Stolen: ${currentMoney - newCurrentMoney}`);
            ns.print(`Hacking complete!`)
        }
    }
}