import { NS } from '@ns'
import { JobExecutor } from '/lib/JobExecutor'

export async function main(ns : NS) : Promise<void> {
    const includeHome = ns.args[0] === '--home' ? true : false;
    const jobExecutor = new JobExecutor(ns, 1, 2, includeHome);
    await jobExecutor.run();
}