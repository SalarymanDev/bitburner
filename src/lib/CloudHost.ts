import { NS } from '@ns'

export class CloudHost {

    constructor(private ns: NS) {}

    public getServerMaxRam(): number {
        return 0;
    }

    public getServerUsedRam(): number {
        return 0;
    }
 }