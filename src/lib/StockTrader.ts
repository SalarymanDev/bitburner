import { NS } from '@ns'
import { NumberFormatter } from '/lib/NumberFormatter';

export class StockTrader {
    private commission = 100000;

    private symbols: string[];
    private stocks: Stock[] = [];
    private myStocks: Stock[] = [];
    private currentFunds: number;
    private realizedGains = 0;

    constructor(private ns: NS, private seedMoney: number) {
        this.currentFunds = seedMoney;
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
                const affordableShares = Math.floor((this.currentFunds - this.commission) / stock.price);
                const sharesRemaining = this.ns.stock.getMaxShares(stock.symbol) - stock.shares;
                const sharesToBuy = Math.max(Math.min(affordableShares, sharesRemaining), 0);
                if ((sharesToBuy * stock.volatility * stock.probability * stock.price) > this.commission) {
                    this.buy(stock, sharesToBuy);
                }
            }

            this.printPortfolio();
            this.printTotals();
            await this.ns.sleep(2500);
        }
    }

    printPortfolio(): void {
        for (const stock of this.myStocks) {
            this.ns.print(`${stock.symbol}`);
            this.ns.print(` Shares: ${NumberFormatter.format(stock.shares)}`);
            this.ns.print(` Price: ${NumberFormatter.formatMoney(stock.price)}`);
            this.ns.print(` Buy Price: ${NumberFormatter.formatMoney(stock.buyPrice)}`);
            this.ns.print(` Percent Gain: ${this.percentGain(stock).toFixed(2)}%`);
            this.ns.print(` Unrealized P&L: ${NumberFormatter.formatMoney((stock.price - stock.buyPrice) * stock.shares)}`);
        }
    }

    printTotals(): void {
        this.ns.print('\nTotals:')
        this.ns.print(`Net Asset Value: ${NumberFormatter.formatMoney(this.myStocks.map(stock => stock.price * stock.shares).reduce((a, b) => a + b, 0))}`)
        this.ns.print(`Liquid Cash: ${NumberFormatter.formatMoney(this.currentFunds)}`);
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
            if (stock.shares > 0) this.myStocks.push(stock);
        }
        this.stocks = this.stocks.filter(stock => stock.probability > 0.5);
        this.stocks.sort((a, b) => b.probability - a.probability);
    }

    buy(stock: Stock, shares: number): void {
        this.ns.stock.buyStock(stock.symbol, shares);
        this.currentFunds -= (shares * stock.price);
    }

    sell(stock: Stock, shares: number): void {
        const profit = shares * (stock.price - stock.buyPrice) - (2 * this.commission);
        this.ns.stock.sellStock(stock.symbol, shares);
        this.realizedGains += profit;
        this.currentFunds += (shares * stock.price);
    }
}

export class Stock {
    public readonly price: number;
    public readonly shares: number;
    public readonly buyPrice: number;
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