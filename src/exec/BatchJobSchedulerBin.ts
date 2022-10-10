import { NS } from '@ns'
import { BatchJobScheduler } from '/lib/BatchJobScheduler'

export async function main(ns : NS) : Promise<void> {
    const batchJobScheduler = new BatchJobScheduler(ns);
    await batchJobScheduler.run();
}