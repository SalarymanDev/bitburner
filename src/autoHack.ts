import { NS } from '@ns'
import { HackFarmStrategy } from '/lib/HackFarmStrategy';

export async function main(ns : NS) : Promise<void> {
    const target: string = ns.args[0] as string;
	const strategy = new HackFarmStrategy(ns, target);
	await strategy.run();
}