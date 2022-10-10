import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    const currentHost = ns.getHostname();

    while (true) {
        const currentSecurityLevel = ns.getServerSecurityLevel(currentHost);
        const minSecurityLevel = ns.getServerMinSecurityLevel(currentHost);
        const maxMoney = ns.getServerMaxMoney(currentHost);
        const currentMoney = ns.getServerMoneyAvailable(currentHost);

        if (currentSecurityLevel > (minSecurityLevel + 1)) {
            await ns.weaken(currentHost);
        } else if (currentMoney < (maxMoney * 0.9)) {
            await ns.grow(currentHost);
        } else {
            await ns.hack(currentHost);
        }
    }
}