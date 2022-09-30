import { NS } from '@ns'
import { NetworkScanner } from '/lib/NetworkScanner';

export async function main(ns : NS) : Promise<void> {
    new NetworkScanner(ns).print();
}
