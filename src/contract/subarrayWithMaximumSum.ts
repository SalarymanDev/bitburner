import { NS } from '@ns'

/** 
 * Subarray with Maximum Sum
 * Given the following integer array, find the contiguous subarray (containing at least one number) which has the largest sum and return that sum. 'Sum' refers to the sum of all the numbers in the subarray.
 * -9,9,5,10,-9,3,5,-9,-2,5,-10,10
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const numbers = ns.codingcontract.getData(contractName, hostname) as number[];

	let maxSoFar = numbers[0];
	let maxEndingHere = numbers[0];

	for (let i = 1; i < numbers.length; i++) {
		maxEndingHere = Math.max(numbers[i], maxEndingHere + numbers[i]);
		maxSoFar = Math.max(maxSoFar, maxEndingHere);
	}

	const result = maxSoFar;

	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}