import { NS } from '@ns'
import { NumberFormatter } from '/lib/NumberFormatter';

export class StockTraderSimple {
    private commission = 100000;

    private symbols: string[];
    private stocks: Stock[] = [];
    private myStocks: Stock[] = [];
    private funds: number;
    private realizedGains = 0;
    private initialFunds: number;
    private myPositions: Map<string, { shares: number; buyPrice: number }> = new Map();

    constructor(private ns: NS, seedMoney: number) {
        this.funds = seedMoney;
        this.initialFunds = seedMoney;
        this.symbols = this.ns.stock.getSymbols();
        this.ns.disableLog('ALL');
    }

    async run(): Promise<void> {
        while(true) {
            this.ns.clearLog();
            this.refresh();

            // Sell if stock forecast sucks
            for (const stock of this.myStocks) {
                // Hodl
                if (stock.probability > 0.5 && this.percentGain(stock) < 20) continue;

                this.sell(stock, stock.shares);
            }

            // Buy shares with cash remaining
            for (const stock of this.stocks) {
                const affordableShares = Math.floor((this.funds - this.commission) / stock.price);
                const sharesRemaining = this.ns.stock.getMaxShares(stock.symbol) - stock.shares;
                const sharesToBuy = Math.max(Math.min(affordableShares, sharesRemaining), 0);
                if ((sharesToBuy * stock.volatility * stock.probability * stock.price) > this.commission * 2) {
                    const askPrice = this.ns.stock.getAskPrice(stock.symbol);
                    const totalCost = (sharesToBuy * askPrice) + this.commission;
                    if (totalCost <= this.funds) {
                        this.buy(stock, sharesToBuy);
                    } else {
                        const adjustedShares = Math.floor((this.funds - this.commission) / askPrice);
                        if (adjustedShares > 0) {
                            this.buy(stock, adjustedShares);
                        }
                    }
                }
            }

            this.printPortfolio();
            this.printTotals();
            await this.ns.sleep(2500);
        }
    }

    printPortfolio(): void {
        for (const stock of this.myStocks) {
            let line = `${stock.symbol}: `;
            if (stock.shares > 0) {
                const gain = this.percentGain(stock).toFixed(2);
                line += `Long ${NumberFormatter.format(stock.shares)} (${gain}%) `;
            }
            line += `@ ${NumberFormatter.formatMoney(stock.price)}`;
            this.ns.print(line);
        }
    }

    printTotals(): void {
        this.ns.print('\nTotals:')
        const nav = this.myStocks.map(stock => stock.price * stock.shares).reduce((a, b) => a + b, 0);
        const totalValue = nav + this.funds;
        const gainPercent = ((totalValue - this.initialFunds) / this.initialFunds) * 100;
        this.ns.print(`Net Asset Value: ${NumberFormatter.formatMoney(nav)}`)
        this.ns.print(`Liquid Cash: ${NumberFormatter.formatMoney(this.funds)}`);
        this.ns.print(`Total Value: ${NumberFormatter.formatMoney(totalValue)}`);
        this.ns.print(`Percentage Gain: ${gainPercent.toFixed(2)}%`);
        this.ns.print(`Unrealized P&L: ${NumberFormatter.formatMoney(this.myStocks.map(stock => (stock.price - stock.buyPrice) * stock.shares).reduce((a, b) => a + b, 0))}`);
        this.ns.print(`Realized P&L: ${NumberFormatter.formatMoney(this.realizedGains)}`);
    }

    percentGain(stock: Stock): number {
        return (((stock.price - stock.buyPrice) / stock.buyPrice) * 100);
    }

    refresh(): void {
        this.myStocks = [];
        this.stocks = [];
        for (const symbol of this.symbols) {
            const stock = new Stock(this.ns, symbol);
            this.stocks.push(stock);
            const myPos = this.myPositions.get(symbol);
            if (myPos && myPos.shares > 0) {
                stock.shares = myPos.shares;
                stock.buyPrice = myPos.buyPrice;
                this.myStocks.push(stock);
            }
        }
        this.stocks = this.stocks.filter(stock => stock.probability > 0.5);
        this.stocks.sort((a, b) => b.probability - a.probability);
    }

    buy(stock: Stock, shares: number): void {
        const price = this.ns.stock.buyStock(stock.symbol, shares);
        this.funds -= ((shares * price) + this.commission);
        const existing = this.myPositions.get(stock.symbol) || { shares: 0, buyPrice: 0 };
        const prevShares = existing.shares;
        existing.shares += shares;
        existing.buyPrice = (existing.buyPrice * prevShares + price * shares) / existing.shares;
        this.myPositions.set(stock.symbol, existing);
    }

    sell(stock: Stock, shares: number): void {
        const price = this.ns.stock.sellStock(stock.symbol, shares);
        const profit = (shares * (price - stock.buyPrice)) - (2 * this.commission);
        this.funds += ((shares * price) - this.commission);
        this.realizedGains += profit;
        const existing = this.myPositions.get(stock.symbol);
        if (existing) {
            existing.shares -= shares;
            if (existing.shares <= 0) this.myPositions.delete(stock.symbol);
        }
    }
}

export class Stock {
    public readonly price: number;
    public shares: number;
    public buyPrice: number;
    public readonly volatility: number;
    public readonly probability: number;

    constructor(private ns: NS, public readonly symbol: string) {
        this.price = ns.stock.getPrice(symbol);
        this.shares = ns.stock.getPosition(symbol)[0];
        this.buyPrice = ns.stock.getPosition(symbol)[1];
        this.volatility = ns.stock.getVolatility(symbol);
        this.probability = ns.stock.getForecast(symbol);
    }
}