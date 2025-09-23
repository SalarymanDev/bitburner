import { NS } from '@ns'
import { StockTraderSimple } from '/lib/StockTraderSimple'

export async function main(ns : NS) : Promise<void> {
    const seedMoney = ns.args[0] as number;
    const stockTrader = new StockTraderSimple(ns, seedMoney);
    await stockTrader.run();
}