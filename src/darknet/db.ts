import { NS } from '@ns'

const passwordMap = new Map<string, string>();
passwordMap.set('darkweb', '');

export async function main(ns : NS) : Promise<void> {
	ns.disableLog('sleep');
	ns.writePort(10, passwordMap);

	while (true) {
		let portData = ns.readPort(11);
		let dirty = false;
		while (portData != 'NULL PORT DATA') {
			ns.print(`Added ${portData.host} : ${portData.password}`);
			passwordMap.set(portData.host, portData.password);
			dirty = true;
			portData = ns.readPort(11);
		}

		if (dirty) {
			ns.clearPort(10);
			ns.writePort(10, passwordMap);
		}
		await ns.sleep(25);
	}
}