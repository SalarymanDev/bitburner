export class Job implements IJob {
    public id: string = uuid();
    public processes: Process[] = [];
    public executedThreads = 0;
    public actionRamUsage: number;

    constructor(public target: string, public action: JobAction, public threads: number) {
        this.actionRamUsage = action === JobAction.Hack ? 1.7 : 1.75;
    }
}

export interface IJob {
    id: string,
    processes: Process[],
    executedThreads: number,
    actionRamUsage: number,
    target: string,
    action: JobAction,
    threads: number
}

export interface Process {
    host: string,
    pid: number,
    complete: boolean
}

export enum JobAction {
    Weaken = '/basic/weaken.js',
    Grow = '/basic/grow.js',
    Hack = '/basic/hack.js'
}

export const uuid = (): string =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
