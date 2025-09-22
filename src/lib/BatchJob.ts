import { JobAction, uuid } from "/lib/Job";

export class BatchJob implements IBatchJob {
    public id: string = uuid();
    public processes: Process[] = [];
    public startTime = 0;
    public endTime = 0;

    public hack: ITask = {
        action: JobAction.Hack,
        threads: 0,
        duration: 0,
    };
    public hackWeaken: ITask = {
        action: JobAction.Weaken,
        threads: 0,
        duration: 0,
    };
    public grow: ITask = {
        action: JobAction.Grow,
        threads: 0,
        duration: 0,
    };
    public growWeaken: ITask = {
        action: JobAction.Weaken,
        threads: 0,
        duration: 0,
    };

    constructor(public target: string) {}

    public totalThreads(): number {
        return this.hack.threads + this.hackWeaken.threads + this.grow.threads + this.growWeaken.threads;
    }
}

export interface ITask {
    action: JobAction,
    duration: number,
    threads: number
}

export interface IBatchJob {
    id: string,
    processes: Process[],
    target: string,
    startTime: number,
    endTime: number,
    hack: ITask,
    hackWeaken: ITask,
    grow: ITask,
    growWeaken: ITask,
}

export interface Process {
    host: string,
    pid: number,
    complete: boolean
}