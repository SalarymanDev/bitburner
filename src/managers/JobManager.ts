import { NS } from '@ns'
import { Job, JobAction } from '/lib/Job'
import { Queue } from '/lib/Queue'

export class JobManager {
    constructor(private ns: NS, private inputPort: number, private outputPort: number) {}

    private jobQueue: Queue<Job> = new Queue<Job>();

    public add(job: Job): void {
        this.jobQueue.enqueue(job);
    }
}