import { NetscriptPort, NS } from '@ns'
import { Job, JobAction } from '/lib/Job';
import { Queue } from '/lib/Queue';
import { TargetRanker } from '/lib/TargetRanker';

export class JobScheduler {
    private inputPort: NetscriptPort;
    private outputPort: NetscriptPort;
    private targetRanker: TargetRanker;

    private jobQueue = new Queue<Job>();
    private dispatchedJobToTargetMap = new Map<string, string>();

    constructor(private ns: NS, inputPort: number, outputPort: number) {
        this.inputPort = ns.getPortHandle(inputPort);
        this.outputPort = ns.getPortHandle(outputPort);
        this.outputPort.clear();
        this.targetRanker = new TargetRanker(ns);
    }

    public async run(): Promise<void> {
        while(true) {
            this.sendJobToExecutor();
            this.checkForCompletedJobs();

            if (!this.jobQueue.isEmpty()) {
                this.ns.print(`Jobs still in queue. waiting...`);
                await this.ns.sleep(10);
                continue;
            }

            const targets = this.targetRanker.getRankedTargets()
                .filter(target => !this.dispatchedJobToTargetMap.has(target));

            if (targets.length === 0) {
                this.ns.print(`All targets dispatched. waiting...`);
                await this.ns.sleep(100);
                continue;
            }
            
            for (const target of targets) {
                this.createJobInQueue(target);
            }
            
            await this.ns.sleep(10);
        }
    }

    private checkForCompletedJobs(): void {
        if (this.inputPort.empty()) return;

        const jobId = this.inputPort.read() as string;
        this.ns.print(`Job ${jobId} Completed`);
        this.dispatchedJobToTargetMap.delete(jobId);
    }

    private sendJobToExecutor(): void {
        if (this.jobQueue.isEmpty()) return;
        if (this.outputPort.full()) return;

        const job = this.jobQueue.dequeue() as Job;
        const jobJson = JSON.stringify(job);
        this.ns.print(`Sending Job ${job.id} to Executor`);
        this.outputPort.write(jobJson);
    }

    private createJobInQueue(target: string): void {
        const minsSecurityLevel = this.ns.getServerMinSecurityLevel(target);
        const maxMoney = this.ns.getServerMaxMoney(target);

        const currentSecurityLevel = this.ns.getServerSecurityLevel(target);
        const currentMoney = this.ns.getServerMoneyAvailable(target);

        let job: Job;

        if (currentSecurityLevel > (minsSecurityLevel + 5)) {
            const weakensNeeded = Math.ceil((currentSecurityLevel - minsSecurityLevel) / 0.05);
            job = new Job(target, JobAction.Weaken, weakensNeeded);
        } else if (currentMoney < (maxMoney * 0.9)) {
            const moneyNeeded = maxMoney - currentMoney;
            const growthsNeeded = Math.ceil(this.ns.growthAnalyze(target, moneyNeeded));
            job = new Job(target, JobAction.Grow, growthsNeeded);
        } else {
            const hacksNeeded = Math.ceil(this.ns.hackAnalyzeThreads(target, currentMoney));
            job = new Job(target, JobAction.Hack, hacksNeeded);
        }

        this.ns.print(`Adding Job ${job.id} to Queue`);
        this.jobQueue.enqueue(job);
        this.dispatchedJobToTargetMap.set(job.id, target);
    }

}