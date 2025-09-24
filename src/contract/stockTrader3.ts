import { NS } from '@ns'

/**
 * Algorithmic Stock Trader III
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * 
 * You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:
 * 
 * 14,157,185,184,139,160,180,174,13,86,100,88,77,135,88,155,174,24,198,71,102,35,66,184,130,20,125,132,26,87,120,41,53,131,123,38,163,155,63,118,128,71,19,18,65,158
 * 
 * Determine the maximum possible profit you can earn using at most two transactions. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you buy it again.
 * 
 * If no profit can be made, then the answer should be 0.
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;

	const transactions = 2;
	const prices = ns.codingcontract.getData(contractName, hostname) as [number, number[]];
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