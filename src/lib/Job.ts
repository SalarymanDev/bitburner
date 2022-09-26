export interface Job {
    target: string,
    action: JobAction,
    ramNeeded: number
}

export enum JobAction {
    Weaken,
    Grow,
    Hack
}