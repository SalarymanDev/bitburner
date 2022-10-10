import { JobAction, uuid } from "/lib/Job";

export class BatchJob implements IBatchJob {
    public id: string = uuid();
    public processes: Process[] = [];
    public startTime = 0;
    public endTime = 0;

    public hack: ITask = {
        action: JobAction.Hack,
        threads: 0,
        startTime: 0,
        endTime: 0,
        running: false
    };
    public hackWeaken: ITask = {
        action: JobAction.Weaken,
        threads: 0,
        startTime: 0,
        endTime: 0,
        running: false
    };
    public grow: ITask = {
        action: JobAction.Grow,
        threads: 0,
        startTime: 0,
        endTime: 0,
        running: false
    };
    public growWeaken: ITask = {
        action: JobAction.Weaken,
        threads: 0,
        startTime: 0,
        endTime: 0,
        running: false
    };

    constructor(public target: string, public server: string) {}
}

export interface ITask {
    action: JobAction,
    threads: number,
    startTime: number,
    endTime: number,
    running: boolean
}

export interface IBatchJob {
    id: string,
    processes: Process[],
    target: string,
    server: string,
    startTime: number,
    endTime: number,
    hack: ITask,
    hackWeaken: ITask,
    grow: ITask,
    growWeaken: ITask
}

export interface Process {
    host: string,
    pid: number,
    complete: boolean
}