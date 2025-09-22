import { NS } from '@ns'

/**
 * Algorithmic Stock Trader I
 * You are attempting to solve a Coding Contract. You have 5 tries remaining, after which the contract will self-destruct.
 * 
 * You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:
 * 
 * 151,102,4,119,6,50,13,72,16,82,136,88,43,34,70,100,126,30,63,180,84,164,144,182,29,151,168,100,66,115,58,64,175,186,163,79,120,125,33,78,25,113,165,74,137,126,166,38,40
 * 
 * Determine the maximum possible profit you can earn using at most one transaction (i.e. you can only buy and sell the stock once). If no profit can be made then the answer should be 0. Note that you have to buy the stock before you can sell it.
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */

export async function main(ns : NS) : Promise<void> {
	const prices = [151,102,4,119,6,50,13,72,16,82,136,88,43,34,70,100,126,30,63,180,84,164,144,182,29,151,168,100,66,115,58,64,175,186,163,79,120,125,33,78,25,113,165,74,137,126,166,38,40];
	let maxProfit = 0;

	for (let buyIndex = 0; buyIndex < prices.length; buyIndex++) {
		for (let sellIndex = buyIndex + 1; sellIndex < prices.length; sellIndex++) {
			const profit = prices[sellIndex] - prices[buyIndex];
			if (profit > maxProfit) {
				maxProfit = profit;
			}
		}
	}

	ns.tprint(maxProfit);
}