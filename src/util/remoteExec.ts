import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    if (ns.args[0] === '-h' || ns.args[0] === 'help') {
		ns.tprint('Usage: run remoteExec.js <worker> <script> [script args]');
	}

	const worker: string = ns.args[0] as string;
	const script: string = ns.args[1] as string;
	const scriptArgs: any[] = ns.args.slice(2);

	await ns.scp(script, worker, 'home');
	const pid = ns.exec(script, worker, 1, ...scriptArgs);

	ns.tprint(`Create PID: ${pid} on ${worker}`);
}