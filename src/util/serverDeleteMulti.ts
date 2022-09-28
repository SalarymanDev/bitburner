import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    if (ns.args[0] === '-h' || ns.args[0] === 'help') {
		ns.tprint('Usage: run serverDeleteMulti.js <start> <number>');
	}

	const start: number = ns.args[0] as number;
	const num: number = ns.args[1] as number;

	ns.tprint(`Deleting ${num} servers`);
	for (let i = 0; i < num; i++) {
		const hostname = 'worker' + (start + i).toString();
		ns.deleteServer(hostname);
	}
}
