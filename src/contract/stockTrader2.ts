import { NS } from '@ns'

/** 
 * Algorithmic Stock Trader II
 * You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:
 *  * 
 * 35,98,118,82,83,3,189,168,175,119,142,162,113,65,105,148,179,88,125,84,21,18,95,12,41,44,3,185,83,176,91,16,37,93,148,128,18,73,56,9
 * 
 * Determine the maximum possible profit you can earn using as many transactions as you'd like. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you buy it again.
 * 
 * If no profit can be made, then the answer should be 0.
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const prices = ns.codingcontract.getData(contractName, hostname) as number[];

	const n = prices.length;
	let profit = 0;
	for (let i = 1; i < n; i++) {
		if (prices[i] > prices[i-1]) {
			profit += prices[i] - prices[i-1];
		}
	}

	const result = profit;

	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}