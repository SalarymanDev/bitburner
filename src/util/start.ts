import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    ns.exec('/exec/Rooter.js', 'home');
    ns.exec('/exec/JobSchedulerBin.js', 'home');
    ns.exec('/exec/JobExecutorBin.js', 'home');
}
