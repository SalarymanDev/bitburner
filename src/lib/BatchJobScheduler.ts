import { NS } from '@ns'
import { BatchJob } from '/lib/BatchJob';
import { NetworkScanner } from '/lib/NetworkScanner';
import { TargetRanker } from '/lib/TargetRanker';

export class BatchJobScheduler {
    private targetRanker: TargetRanker;
    private network: NetworkScanner;

    private prepJobs = new Map<string, BatchJob>();
    private runningJobs = new Map<string, BatchJob>();

    private currentTime: number;

    constructor(private ns: NS) {
        this.targetRanker = new TargetRanker(ns);
        this.network = new NetworkScanner(ns);
        this.currentTime = this.ns.getTimeSinceLastAug();
        this.ns.disableLog('ALL');
    }

    public async run(): Promise<void> {
        while(true) {
            // Schedule jobs
            for (const job of this.runningJobs.values()) {
                if (job.startTime === 0) {
                    this.scheduleJob(job);
                } else {
                    this.monitorJob(job);
                }
            }

            for (const job of this.prepJobs.values()) {
                if (job.startTime === 0) {
                    this.scheduleJob(job);
                } else {
                    this.monitorJob(job);
                }
            }

            this.network.update();
            const servers = this.network.getPurchasedNetwork().filter(server => this.ns.getServerUsedRam(server) === 0);
            servers.forEach(host => this.copyScripts(host));
            const targets = this.targetRanker.getRankedTargets().filter(target => !this.runningJobs.has(target) && !this.prepJobs.has(target));
            // const targets = ['joesguns'].filter(target => !this.runningJobs.has(target));
            for (let i = 0; i < targets.length && i < servers.length; i++) {
                this.createJob(targets[i], servers[i]);
            }
            
            await this.ns.sleep(10);
        }
    }

    private monitorJob(job: BatchJob) {
        const currentTime = this.ns.getTimeSinceLastAug();

        if (job.hack.threads > 0 && job.hack.startTime <= currentTime && job.hack.endTime > currentTime && !job.hack.running) {
            // this.ns.tprint(`Hack ${job.target}`);
            this.ns.exec(job.hack.action, job.server, job.hack.threads, job.target);
            job.hack.running = true;
        }

        if (job.hackWeaken.threads > 0 && job.hackWeaken.startTime <= currentTime && job.hackWeaken.endTime > currentTime && !job.hackWeaken.running) {
            // this.ns.tprint(`Weaken(Hack) ${job.target}`);
            this.ns.exec(job.hackWeaken.action, job.server, job.hackWeaken.threads, job.target);
            job.hackWeaken.running = true;
        }

        if (job.grow.threads > 0 && job.grow.startTime <= currentTime && job.grow.endTime > currentTime && !job.grow.running) {
            // this.ns.tprint(`Grow ${job.target}`);
            this.ns.exec(job.grow.action, job.server, job.grow.threads, job.target);
            job.grow.running = true;
        }

        if (job.growWeaken.threads > 0 && job.growWeaken.startTime <= currentTime && job.growWeaken.endTime > currentTime && !job.growWeaken.running) {
            // this.ns.tprint(`Weaken(Grow) ${job.target}`);
            this.ns.exec(job.growWeaken.action, job.server, job.growWeaken.threads, job.target);
            job.growWeaken.running = true;
        }

        if (job.hack.running && job.hack.endTime < currentTime) {
            // this.ns.tprint(`Hack ${job.target} Complete!`);
            job.hack.running = false;
        }

        if (job.hackWeaken.running && job.hackWeaken.endTime < currentTime) {
            // this.ns.tprint(`Weaken(Hack) ${job.target} Complete!`);
            job.hackWeaken.running = false;
        }

        if (job.grow.running && job.grow.endTime < currentTime) {
            // this.ns.tprint(`Grow ${job.target} Complete!`);
            job.grow.running = false;
        }

        // If the final task completed reset job for scheduling
        if (job.growWeaken.running && job.growWeaken.endTime < currentTime) {
            // this.ns.tprint(`Weaken(Grow) ${job.target} Complete!`);
            job.growWeaken.running = false;
            // this.ns.tprint(`Batch Job ${job.target} Complete!`);
            if (this.prepJobs.has(job.target)) {
                this.prepJobs.delete(job.target);
            }
            
            if (this.runningJobs.has(job.target)) {
                this.runningJobs.delete(job.target);
            }
        }
    }

    private scheduleJob(job: BatchJob) {
        const bufferTime = 1000;
        const weakenTime = this.ns.getWeakenTime(job.target)
        const growTime = this.ns.getGrowTime(job.target);
        const hackTime = this.ns.getHackTime(job.target);
        job.startTime = this.ns.getTimeSinceLastAug() + bufferTime;

        job.hackWeaken.startTime = job.startTime;
        job.hackWeaken.endTime = job.hackWeaken.startTime + weakenTime;

        job.hack.startTime = job.hackWeaken.endTime - bufferTime - hackTime;
        job.hack.endTime = job.hack.startTime + hackTime;

        job.grow.startTime = job.hackWeaken.endTime + bufferTime - growTime;
        job.grow.endTime = job.grow.startTime + growTime;

        job.growWeaken.startTime = job.grow.endTime + bufferTime - weakenTime;
        job.growWeaken.endTime = job.growWeaken.startTime + weakenTime;
    }

    private createJob(target: string, server: string): void {
        const minsSecurityLevel = this.ns.getServerMinSecurityLevel(target);
        const maxMoney = this.ns.getServerMaxMoney(target);
        const currentSecurityLevel = this.ns.getServerSecurityLevel(target);
        const currentMoney = this.ns.getServerMoneyAvailable(target);

        if (currentSecurityLevel > minsSecurityLevel || currentMoney < maxMoney) {
            this.ns.print(`Prepping '${target}' for attack using '${server}'`);
            this.generateWeakenGrowJob(target, server);
        } else {
            this.ns.print(`Attacking '${target}' with '${server}'`);
            this.generateHackWeakenGrowWeakenJob(target, server);
        }
    }

    private generateHackWeakenGrowWeakenJob(target: string, server: string) {
        const job = new BatchJob(target, server);
        const maxMoney = this.ns.getServerMaxMoney(target);
        const hacksNeeded = Math.ceil(this.ns.hackAnalyzeThreads(target, maxMoney / 2));
        const hackSecurityIncrease = this.ns.hackAnalyzeSecurity(hacksNeeded, target);
        const hackWeakensNeeded = this.getWeakenThreads(hackSecurityIncrease, server);
        const growsNeeded = Math.ceil(this.ns.growthAnalyze(target, maxMoney / 2));
        const growSecurityIncrease = this.ns.growthAnalyzeSecurity(growsNeeded);
        const growWeakensNeeded = this.getWeakenThreads(growSecurityIncrease, server);

        job.hack.threads = hacksNeeded;
        job.hackWeaken.threads = hackWeakensNeeded;
        job.grow.threads = growsNeeded;
        job.growWeaken.threads = growWeakensNeeded;

        this.runningJobs.set(target, job);
    }

    private generateWeakenGrowJob(target: string, server: string) {
        const minsSecurityLevel = this.ns.getServerMinSecurityLevel(target);
        const maxMoney = this.ns.getServerMaxMoney(target);
        const currentSecurityLevel = this.ns.getServerSecurityLevel(target);
        const currentMoney = this.ns.getServerMoneyAvailable(target);
        
        const job = new BatchJob(target, server);
        if (currentSecurityLevel > minsSecurityLevel) {
            const securityDifference = currentSecurityLevel - minsSecurityLevel;
            const weakensNeeded = this.getWeakenThreads(securityDifference, server);
            job.hackWeaken.threads = weakensNeeded;
        }

        if (currentMoney < maxMoney) {
            const growthsNeeded = Math.ceil(this.ns.growthAnalyze(target, maxMoney / currentMoney));
            const securityIncrease = this.ns.growthAnalyzeSecurity(growthsNeeded);
            const weakensNeeded = this.getWeakenThreads(securityIncrease, server);
            job.grow.threads = growthsNeeded;
            job.growWeaken.threads = weakensNeeded;
        }

        if (job.hackWeaken.threads === 0 && job.grow.threads === 0 && job.growWeaken.threads === 0) {
            throw "This should never be reached!";
        }

        this.prepJobs.set(target, job);
    }

    private getWeakenThreads(securityDifference: number, server: string) {
        let weakensNeeded = Math.ceil(securityDifference / 0.05);
        let effectiveWeaken = this.ns.weakenAnalyze(weakensNeeded, this.ns.getServer(server).cpuCores);
        while (effectiveWeaken > securityDifference) {
            weakensNeeded--;
            effectiveWeaken = this.ns.weakenAnalyze(weakensNeeded, this.ns.getServer(server).cpuCores);
        }
        weakensNeeded++;
        return weakensNeeded;
    }

    private copyScripts(host: string) {
        this.ns.scp(['/basic/weaken.js', '/basic/grow.js', '/basic/hack.js', '/basic/farm.js'], host, 'home');
    }
}