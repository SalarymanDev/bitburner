/** @param {NS} ns */
export async function main(ns) {
	if (ns.args[0] === '-h' || ns.args[0] === 'help') {
		ns.tprint('Usage: run remoteExec.js <worker> <script> [script args]');
	}

	const [worker, script, ...scriptArgs] = ns.args;

	await ns.scp(script, worker, 'home');
	const pid = ns.exec(script, worker, 1, ...scriptArgs);

	ns.tprint(`Create PID: ${pid} on ${worker}`);
}