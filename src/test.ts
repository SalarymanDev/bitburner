import { NS } from '@ns';
import { ServerManager } from '/managers/ServerManager';

export async function main(ns : NS) : Promise<void> {
    const serverManager = await new ServerManager(ns);
	await serverManager.scanHosts();
}