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

    // const weakenTime = ns.getWeakenTime(target);
    // const growTime = ns.getGrowTime(target);
    // const hackTime = ns.getHackTime(target);

    const workerRam = ns.getServerMaxRam(worker);

	// const weakenRam = ns.getScriptRam(weakenScript);
	// const growRam = ns.getScriptRam(growScript);
	// const hackRam = ns.getScriptRam(hackScript);

    // const minsSecurityLevel = ns.getServerMinSecurityLevel(target);
	// const currentSecurityLevel = ns.getServerSecurityLevel(target);

    // const maxMoney = ns.getServerMaxMoney(target);
    // const currentMoney = ns.getServerMoneyAvailable(target);
    // const growthRate = ns.getServerGrowth(target);

    // ns.tprint(`Weaken Time: ${weakenTime}`);
    // ns.tprint(`Grow Time: ${growTime}`);
    // ns.tprint(`Hack Time: ${hackTime}`);
    
    // ns.tprint(`Weaken RAM: ${weakenRam}`);
    // ns.tprint(`Grow RAM: ${growRam}`);
    // ns.tprint(`Hack RAM: ${hackRam}`);

    // ns.tprint(`Worker RAM: ${workerRam}`);

    // ns.tprint(`Server Min Security Level: ${minsSecurityLevel}`);
    // ns.tprint(`Server Current Security Level: ${currentSecurityLevel}`);
    // ns.tprint(`Server Max Money: ${maxMoney}`);
    // ns.tprint(`Server Current Money: ${currentMoney}`);
    // ns.tprint(`Server growth factor: ${growthRate}`);

    const weakenRatio = 0.55;
    const growRatio = 0.05;
    const hackRatio = 0.4;

    const threadsAvailable = workerRam / 1.75;
    // ns.tprint(`Threads Available: ${threadsAvailable}`)

    let weakenThreads = Math.floor(threadsAvailable * weakenRatio);
    const growThreads = Math.max(Math.floor(threadsAvailable * growRatio), 1);
    const hackThreads = Math.floor(threadsAvailable * hackRatio);

    const utilizedThreads = weakenThreads + growThreads + hackThreads;

    if (threadsAvailable > utilizedThreads) {
        weakenThreads++;
    } else if (utilizedThreads > threadsAvailable) {
        weakenThreads--;
    }

    // ns.tprint(`Weaken Threads: ${weakenThreads}`);
    // ns.tprint(`Grow Threads: ${growThreads}`);
    // ns.tprint(`Hack Threads: ${hackThreads}`);

    let weakenPid = 0;
    let growPid = 0;
    let hackPid = 0;

    while(true) {
        if (!ns.isRunning(weakenPid, worker)) {
            weakenPid = ns.exec(weakenScript, worker, weakenThreads, target);
        }
        
        if (!ns.isRunning(growPid, worker)) {
            growPid = ns.exec(growScript, worker, growThreads, target);
        }
        
        if (!ns.isRunning(hackPid, worker)) {
            hackPid = ns.exec(hackScript, worker, hackThreads, target);
        }
        
        await ns.sleep(1000);
    }
}