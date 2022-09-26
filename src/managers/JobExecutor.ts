import { NS } from '@ns'

export class JobExecutor {
    constructor(private ns: NS, private port: number) {}
    
    public async run(): Promise<void> {
        while(true) {
            //
        }
    }
}