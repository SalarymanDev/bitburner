import { NetscriptPort, NS } from '@ns'
import { IJob, Job, JobAction } from '/lib/Job';
import { Queue } from '/lib/Queue';
import { TargetRanker } from '/lib/TargetRanker';

export class JobScheduler {
    private inputPort: NetscriptPort;
    private outputPort: NetscriptPort;
    private targetRanker: TargetRanker;

    private jobQueue = new Queue<Job>();
    private targetsWithJobs = new Set<string>();

    constructor(private ns: NS, inputPort: number, outputPort: number) {
        this.inputPort = ns.getPortHandle(inputPort);
        this.outputPort = ns.getPortHandle(outputPort);
        this.outputPort.clear();
        this.inputPort.clear();
        this.targetRanker = new TargetRanker(ns);
        this.ns.disableLog('ALL');
    }

    public async run(): Promise<void> {
        while(true) {
            this.sendJobsToExecutor();
            this.checkForCompletedJobs();

            if (!this.jobQueue.isEmpty()) {
                // this.ns.print(`Jobs still in queue. waiting...`);
                await this.ns.sleep(10);
                continue;
            }

            const targets = this.targetRanker.getRankedTargets()
                .filter(target => !this.targetsWithJobs.has(target));

            if (targets.length === 0) {
                // this.ns.print(`All targets dispatched. waiting...`);
                await this.ns.sleep(10);
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

        const jobJson = this.inputPort.read() as string;
        const completedJob = JSON.parse(jobJson) as IJob;
        this.ns.print(`Completed Job ${completedJob.id}`);
        this.targetsWithJobs.delete(completedJob.target);
    }

    private sendJobsToExecutor(): void {
        if (this.jobQueue.isEmpty()) return;
        if (this.outputPort.full()) return;

        while(!this.jobQueue.isEmpty() && !this.outputPort.full()) {
            const job = this.jobQueue.dequeue() as Job;
            const jobJson = JSON.stringify(job);
            this.ns.print(`Scheduled Job ${job.id}`);
            this.ns.print(`    Target: ${job.target}`);
            this.ns.print(`    Action: ${job.action}`);
            this.ns.print(`    Threads: ${job.threads}`);
            this.outputPort.write(jobJson);
        }
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
            const growthAmount = maxMoney / currentMoney;
            const growthsNeeded = Math.ceil(this.ns.growthAnalyze(target, growthAmount));
            job = new Job(target, JobAction.Grow, growthsNeeded);
        } else {
            const hacksNeeded = Math.ceil(this.ns.hackAnalyzeThreads(target, currentMoney / 2));
            job = new Job(target, JobAction.Hack, hacksNeeded);
        }

        // this.ns.print(`Adding Job ${job.id} to Queue`);
        this.jobQueue.enqueue(job);
        this.targetsWithJobs.add(target);
    }

}