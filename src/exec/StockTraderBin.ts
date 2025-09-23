import { NS } from '@ns'
import { StockTrader } from '/lib/StockTrader'

export async function main(ns : NS) : Promise<void> {
    const seedMoney = ns.args[0] as number;
    if (!seedMoney || seedMoney <= 0 || isNaN(seedMoney)) {
        ns.tprint('Usage: run StockTraderBin.js <seedMoney>');
        return;
    }
    const stockTrader = new StockTrader(ns, seedMoney);
    await stockTrader.run();
}