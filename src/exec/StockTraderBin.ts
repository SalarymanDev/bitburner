import { NS } from '@ns'
import { StockTrader } from '/lib/StockTrader'

export async function main(ns : NS) : Promise<void> {
    const seedMoney = ns.args[0] as number;
    const stockTrader = new StockTrader(ns, seedMoney);
    await stockTrader.run();
}