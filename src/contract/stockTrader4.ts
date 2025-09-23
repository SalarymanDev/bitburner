import { NS } from '@ns'

/**
 * Algorithmic Stock Trader IV
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * 
 * You are given the following array with two elements:
 * 
 * [3, [164,133,39,91,198,146,18,78,162,71,133,192]]
 * 
 * The first element is an integer k. The second element is an array of stock prices (which are numbers) where the i-th element represents the stock price on day i.
 * 
 * Determine the maximum possible profit you can earn using at most k transactions. A transaction is defined as buying and then selling one share of the stock.
 * Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you can buy it again.
 * 
 * If no profit can be made, then the answer should be 0.
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;

	const [transactions, prices] = ns.codingcontract.getData(contractName, hostname) as [number, number[]];
	let maxProfit = 0;

	if (transactions === 0 || prices.length === 0) {
		maxProfit = 0;
	} else {
		const buy = Array(transactions + 1).fill(Infinity);
		const sell = Array(transactions + 1).fill(0);
		for (const price of prices) {
			for (let j = 1; j <= transactions; j++) {
				buy[j] = Math.min(buy[j], price - sell[j - 1]);
				sell[j] = Math.max(sell[j], price - buy[j]);
			}
		}
		maxProfit = sell[transactions];
	}

	const reward = ns.codingcontract.attempt(maxProfit, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}