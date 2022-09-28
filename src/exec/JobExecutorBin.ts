import { NS } from '@ns'
import { JobExecutor } from '/lib/JobExecutor'

export async function main(ns : NS) : Promise<void> {
    const jobExecutor = new JobExecutor(ns, 1, 2);
    await jobExecutor.run();
}