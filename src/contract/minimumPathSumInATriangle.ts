import { NS } from '@ns'

/** 
 * Minimum Path Sum in a Triangle
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * 
 * Given a triangle, find the minimum path sum from top to bottom. In each step of the path, you may only move to adjacent numbers in the row below. The triangle is represented as a 2D array of numbers:
 * [
 *           [4],
 *          [3,6],
 *         [8,8,2],
 *        [3,4,6,8],
 *       [2,3,9,2,1],
 *      [1,3,4,9,4,3],
 *     [5,6,7,1,7,8,9],
 *    [7,8,1,5,7,5,7,6],
 *   [8,7,4,4,3,3,6,9,3]
 * ]
 * 
 * Example: If you are given the following triangle:
 * [
 *      [2],
 *     [3,4],
 *    [6,5,7],
 *   [4,1,8,3]
 * ]
 * 
 * The minimum path sum is 11 (2 -> 3 -> 5 -> 1).
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const input = ns.codingcontract.getData(contractName, hostname) as number[][];

	const n = input.length;
	const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
	dp[0][0] = input[0][0];

	for (let i = 1; i < n; i++) {
		for (let j = 0; j <= i; j++) {
			if (j === 0) {
				dp[i][j] = dp[i - 1][j] + input[i][j];
			} else if (j === i) {
				dp[i][j] = dp[i - 1][j - 1] + input[i][j];
			} else {
				dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j]) + input[i][j];
			}
		}
	}

	const minPathSum = Math.min(...dp[n - 1]);

	const reward = ns.codingcontract.attempt(minPathSum, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}