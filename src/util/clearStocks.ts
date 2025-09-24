import { NS } from '@ns'
import { StockTrader } from '/lib/StockTrader'

export async function main(ns : NS) : Promise<void> {
	const stockTrader = new StockTrader(ns, 0);
	stockTrader.sellAll();
}