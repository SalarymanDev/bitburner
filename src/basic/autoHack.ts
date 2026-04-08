import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
	if (ns.args[0] === '-h' || ns.args[0] === 'help') {
		ns.tprint('Usage: run autoHack.js <target>');
	}

	const target: string = ns.args[0] as string;

	while (true) {
        const currentSecurityLevel = ns.getServerSecurityLevel(target);
        const minSecurityLevel = ns.getServerMinSecurityLevel(target);
        const maxMoney = ns.getServerMaxMoney(target);
        const currentMoney = ns.getServerMoneyAvailable(target);

        if (currentSecurityLevel > (minSecurityLevel + 1)) {
            await ns.weaken(target);
        } else if (currentMoney < (maxMoney * 0.9)) {
            await ns.grow(target);
        } else {
            await ns.hack(target);
        }
    }
}