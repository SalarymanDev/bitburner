import { NS } from '@ns'

/** 
 * Merge Overlapping Intervals
 * Given the following array of arrays of numbers representing a list of intervals, merge all overlapping intervals.
 * 
 * [[10,16],[24,26],[19,23],[18,27],[12,17],[19,22],[17,21],[11,19],[13,20],[20,25],[21,27],[4,8],[11,12],[22,30],[1,10],[20,25],[23,24]]
 * 
 * Example:
 * [[1, 3], [8, 10], [2, 6], [10, 16]]
 * 
 * would merge into [[1, 6], [8, 16]].
 * 
 * The intervals must be returned in ASCENDING order. You can assume that in an interval, the first number will always be smaller than the second.
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const intervals = ns.codingcontract.getData(contractName, hostname) as number[][];

	intervals.sort((a, b) => a[0] - b[0]);

	const merged: number[][] = [];
	for (const interval of intervals) {
		if (merged.length === 0 || merged[merged.length - 1][1] < interval[0]) {
			merged.push(interval);
		} else {
			merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], interval[1]);
		}
	}

	const result = merged;

	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}