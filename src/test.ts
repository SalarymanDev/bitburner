import { NS } from '@ns';
import { ServerManager } from '/managers/ServerManager';


export async function main(ns : NS) : Promise<void> {
    const serverManager = new ServerManager(ns);
    ns.tprint(`Rooted Servers: ${[...serverManager.getRootedServers()]}`);
    ns.tprint(`Purchased Servers: ${[...serverManager.getPurchasedServers()]}`);
}