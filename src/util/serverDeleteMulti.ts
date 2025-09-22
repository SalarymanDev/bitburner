import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    if (ns.args[0] === '-h' || ns.args[0] === 'help') {
		ns.tprint('Usage: run serverDeleteMulti.js <prefix> <start> <number>');
	}

	const prefix: string = ns.args[0] as string;
	const start: number = ns.args[1] as number;
	const num: number = ns.args[2] as number;

	ns.tprint(`Deleting ${num} servers`);
	for (let i = 0; i < num; i++) {
		const hostname = prefix + (start + i).toString();
		ns.deleteServer(hostname);
	}
}
