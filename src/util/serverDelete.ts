import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    if (ns.args[0] === '-h' || ns.args[0] === 'help') {
		ns.tprint('Usage: run serverDelete.js <hostname>');
	}

    const hostname: string = ns.args[0] as string;
	ns.tprint(`Deleting server with hostname '${hostname}'`);
    ns.deleteServer(hostname);
}
