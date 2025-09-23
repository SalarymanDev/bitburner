import { NS } from '@ns'

/**
 * Unique Paths in a Grid II
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * 
 * You are located in the top-left corner of the following grid:
 * 
 * 0,0,0,0,0,0,0,1,0,0,
 * 0,1,0,0,0,0,0,0,0,0,
 * 0,0,0,0,0,0,0,0,0,0,
 * 0,0,1,0,0,0,0,0,0,0,
 * 1,0,0,0,0,0,0,1,0,0,
 * 0,0,0,0,0,1,0,0,0,0,
 * 0,0,0,0,0,0,0,0,0,0,
 * 0,0,0,0,1,0,0,0,0,0,
 * 
 * You are trying reach the bottom-right corner of the grid, but you can only move down or right on each step. Furthermore, there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.
 * 
 * Determine how many unique paths there are from start to finish.
 * 
 * NOTE: The data returned for this contract is an 2D array of numbers representing the grid.
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const grid = ns.codingcontract.getData(contractName, hostname) as number[][];
	ns.tprint(grid);
	const numRows = grid.length;
	const numCols = grid[0].length;
	const memo: {[key: string]: number} = {};

	function countPaths(row: number, col: number): number {
		// If out of bounds or on an obstacle, return 0
		if (row >= numRows || col >= numCols || grid[row][col] === 1) {
			return 0;
		}
		// If reached the bottom-right corner, return 1
		if (row === numRows - 1 && col === numCols - 1) {
			return 1;
		}

		const key = `${row},${col}`;
		if (key in memo) return memo[key];

		// Move down and right
		const paths = countPaths(row + 1, col) + countPaths(row, col + 1);
		memo[key] = paths;
		return paths;
	}

	const result = countPaths(0, 0);
	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}