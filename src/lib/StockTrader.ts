import { NS } from '@ns'
import { NumberFormatter } from '/lib/NumberFormatter';

export class StockTrader {
    private commission = 100000;

    private symbols: string[];
    private stocks: Stock[] = [];
    private allStocks: Stock[] = [];
    private myStocks: Stock[] = [];
    private funds: number;
    private realizedGains = 0;
    private canShort = false;
    private initialFunds: number;
    private myPositions: Map<string, { shares: number; buyPrice: number; shortShares: number; shortBuyPrice: number }> = new Map();

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
                // Hodl if probability >= 0.4 and gain <= 50%
                if (stock.probability >= 0.4 && this.percentGain(stock) <= 50) continue;

                this.sell(stock, stock.shares);
            }

            // Cover shorts if forecast improves
            if (this.canShort) {
                for (const stock of this.myStocks) {
                    if (stock.shortShares > 0 && stock.probability > 0.6) {
                        this.shortSell(stock, stock.shortShares);
                    }
                }
            }

            // Stop-loss and take-profit for longs
            for (const stock of this.myStocks) {
                if (stock.shares > 0) {
                    const gain = this.percentGain(stock);
                    if (gain < -10 || gain > 30) {
                        this.sell(stock, stock.shares);
                    }
                }
            }

            // Stop-loss and take-profit for shorts
            if (this.canShort) {
                for (const stock of this.myStocks) {
                    if (stock.shortShares > 0) {
                        const shortGain = (((stock.shortBuyPrice - stock.price) / stock.shortBuyPrice) * 100);
                        if (shortGain < -10 || shortGain > 30) {
                            this.shortSell(stock, stock.shortShares);
                        }
                    }
                }
            }

            // Buy shares with cash remaining
            for (const stock of this.stocks) {
                const affordableShares = Math.floor((this.funds - this.commission) / stock.price);
                const sharesRemaining = this.ns.stock.getMaxShares(stock.symbol) - stock.shares;
                const maxSharesForStock = Math.floor((this.funds * 0.2) / stock.price);
                const sharesToBuy = Math.max(Math.min(affordableShares, sharesRemaining, maxSharesForStock), 0);
                if ((sharesToBuy * stock.volatility * stock.probability * stock.price) > this.commission * 2) {
                    this.buy(stock, sharesToBuy);
                }
            }

            // Short stocks with low forecast
            if (this.canShort) {
                const shortStocks = this.allStocks.filter(stock => stock.probability < 0.5).sort((a, b) => a.probability - b.probability);
                for (const stock of shortStocks) {
                    const affordableShares = Math.floor((this.funds - this.commission) / stock.price);
                    const maxSharesForStock = Math.floor((this.funds * 0.2) / stock.price);
                    const sharesToShort = Math.max(Math.min(affordableShares, maxSharesForStock), 0);
                    if (sharesToShort > 0 && (sharesToShort * stock.volatility * (1 - stock.probability) * stock.price) > this.commission * 2) {
                        this.shortBuy(stock, sharesToShort);
                    }
                }
            }

            this.printPortfolio();
            this.printTotals();

            const avgVolatility = this.stocks.reduce((sum, stock) => sum + stock.volatility, 0) / this.stocks.length;
            const sleepTime = avgVolatility > 0.1 ? 1000 : 2500;
            await this.ns.sleep(sleepTime);
        }
    }

    printPortfolio(): void {
        for (const stock of this.myStocks) {
            let line = `${stock.symbol}: `;
            if (stock.shares > 0) {
                const gain = this.percentGain(stock).toFixed(2);
                line += `Long ${NumberFormatter.format(stock.shares)} (${gain}%) `;
            }
            if (stock.shortShares > 0) {
                const shortGain = (((stock.shortBuyPrice - stock.price) / stock.shortBuyPrice) * 100).toFixed(2);
                line += `Short ${NumberFormatter.format(stock.shortShares)} (${shortGain}%) `;
            }
            line += `@ ${NumberFormatter.formatMoney(stock.price)}`;
            this.ns.print(line);
        }
    }

    printTotals(): void {
        this.ns.print('\nTotals:')
        const nav = this.myStocks.map(stock => stock.price * stock.shares - stock.price * stock.shortShares).reduce((a, b) => a + b, 0);
        const totalValue = nav + this.funds;
        const gainPercent = ((totalValue - this.initialFunds) / this.initialFunds) * 100;
        this.ns.print(`Net Asset Value: ${NumberFormatter.formatMoney(nav)}`)
        this.ns.print(`Liquid Cash: ${NumberFormatter.formatMoney(this.funds)}`);
        this.ns.print(`Total Value: ${NumberFormatter.formatMoney(totalValue)}`);
        this.ns.print(`Percentage Gain: ${gainPercent.toFixed(2)}%`);
        this.ns.print(`Unrealized P&L: ${NumberFormatter.formatMoney(this.myStocks.map(stock => (stock.price - stock.buyPrice) * stock.shares + (stock.shortBuyPrice - stock.price) * stock.shortShares).reduce((a, b) => a + b, 0))}`);
        this.ns.print(`Realized P&L: ${NumberFormatter.formatMoney(this.realizedGains)}`);
    }

    percentGain(stock: Stock): number {
        return (((stock.price - stock.buyPrice) / stock.buyPrice) * 100);
    }

    refresh(): void {
        this.myStocks = [];
        this.allStocks = [];
        for (const symbol of this.symbols) {
            const stock = new Stock(this.ns, symbol);
            this.allStocks.push(stock);
            const myPos = this.myPositions.get(symbol);
            if (myPos && (myPos.shares > 0 || myPos.shortShares > 0)) {
                stock.shares = myPos.shares;
                stock.buyPrice = myPos.buyPrice;
                stock.shortShares = myPos.shortShares;
                stock.shortBuyPrice = myPos.shortBuyPrice;
                this.myStocks.push(stock);
            }
        }
        this.stocks = this.allStocks.filter(stock => stock.probability > 0.5).sort((a, b) => b.probability - a.probability);
    }

    buy(stock: Stock, shares: number): void {
        const price = this.ns.stock.buyStock(stock.symbol, shares);
        this.funds -= ((shares * price) + this.commission);
        const existing = this.myPositions.get(stock.symbol) || { shares: 0, shortShares: 0, buyPrice: 0, shortBuyPrice: 0 };
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

    shortBuy(stock: Stock, shares: number): void {
        const price = this.ns.stock.buyShort(stock.symbol, shares);
        this.funds += ((shares * price) - this.commission);
        const existing = this.myPositions.get(stock.symbol) || { shares: 0, shortShares: 0, buyPrice: 0, shortBuyPrice: 0 };
        const prevShortShares = existing.shortShares;
        existing.shortShares += shares;
        existing.shortBuyPrice = (existing.shortBuyPrice * prevShortShares + price * shares) / existing.shortShares;
        this.myPositions.set(stock.symbol, existing);
    }

    shortSell(stock: Stock, shares: number): void {
        const price = this.ns.stock.sellShort(stock.symbol, shares);
        const profit = (shares * (stock.shortBuyPrice - price)) - (2 * this.commission);
        this.funds -= ((shares * price) + this.commission);
        this.realizedGains += profit;
        const existing = this.myPositions.get(stock.symbol);
        if (existing) {
            existing.shortShares -= shares;
            if (existing.shortShares <= 0) this.myPositions.delete(stock.symbol);
        }
    }
}

export class Stock {
    public readonly price: number;
    public shares: number;
    public buyPrice: number;
    public shortShares: number;
    public shortBuyPrice: number;
    public readonly volatility: number;
    public readonly probability: number;

    constructor(private ns: NS, public readonly symbol: string) {
        this.price = ns.stock.getPrice(symbol);
        const position = ns.stock.getPosition(symbol);
        this.shares = position[0];
        this.buyPrice = position[1];
        this.shortShares = position[2];
        this.shortBuyPrice = position[3];
        this.volatility = ns.stock.getVolatility(symbol);
        this.probability = ns.stock.getForecast(symbol);
        try {
            const data = ns.stock.get4SData(symbol);
            this.probability = Math.max(0, Math.min(1, this.probability + data.otlkMag * 0.1));
        } catch {
            // No 4S data available
        }
    }
}