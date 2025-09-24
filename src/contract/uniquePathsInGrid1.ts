import { NS } from '@ns'

/**
 * Unique Paths in a Grid I
 * You are in a grid with 6 rows and 11 columns, and you are positioned in the top-left corner of that grid.
 * You are trying to reach the bottom-right corner of the grid, but you can only move down or right on each step.
 * Determine how many unique paths there are from start to finish.
 * 
 * NOTE: The data returned for this contract is an array with the number of rows and columns:
 * 
 * [6, 11]
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const [rows, cols] = ns.codingcontract.getData(contractName, hostname) as number[];
	
	const result = uniquePaths(rows, cols);

	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}

function uniquePaths(row: number, col: number): number {
	// Guard against invalid inputs
	if (row <= 0 || col <= 0) return 0;
	// 1D DP: dp[j] is number of ways to reach cell in current row, column j
	const dp = new Array<number>(col).fill(1);
	for (let i = 1; i < row; i++) {
		for (let j = 1; j < col; j++) {
			dp[j] += dp[j - 1];
		}
	}
	return dp[col - 1];
}