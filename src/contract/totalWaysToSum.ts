import { NS } from '@ns'

/**
 * Total Ways to Sum
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * 
 * It is possible write four as a sum in exactly four different ways:
 * 
 *     3 + 1
 *     2 + 2
 *     2 + 1 + 1
 *     1 + 1 + 1 + 1
 * 
 * How many different distinct ways can the number 62 be written as a sum of at least two positive integers?
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const inputNumber = ns.codingcontract.getData(contractName, hostname) as number;
	const memo: {[key: string]: number} = {};

	function countWays(n: number, maxAddend: number): number {
		if (n === 0) return 1; // Found a valid way
		if (n < 0) return 0; // Invalid way

		const key = `${n},${maxAddend}`;
		if (key in memo) return memo[key];

		let totalWays = 0;
		for (let i = Math.min(n, maxAddend); i >= 1; i--) {
			totalWays += countWays(n - i, i);
		}

		memo[key] = totalWays;
		return totalWays;
	}

	const result = countWays(inputNumber, inputNumber - 1); // At least two positive integers
	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}