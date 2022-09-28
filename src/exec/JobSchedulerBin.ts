import { NS } from '@ns'
import { JobScheduler } from '/lib/JobScheduler'

export async function main(ns : NS) : Promise<void> {
    const jobScheduler = new JobScheduler(ns, 2, 1);
    await jobScheduler.run();
}