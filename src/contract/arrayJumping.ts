import { NS } from '@ns'

/** 
 * Array Jumping Game
 * You are given the following array of integers:
 *  0,3,5,8,0,7,0,0,0
 * 
 * Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n. 
 * 
 * Assuming you are initially positioned at the start of the array, determine whether you are able to reach the last index.
 * 
 * Your answer should be submitted as 1 or 0, representing true and false respectively.
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const numbers = ns.codingcontract.getData(contractName, hostname) as number[];

	function canJump(nums: number[]): boolean {
		let maxReach = 0;
		for (let i = 0; i < nums.length; i++) {
			if (i > maxReach) return false; // Can't reach this position
			maxReach = Math.max(maxReach, i + nums[i]);
			if (maxReach >= nums.length - 1) return true; // Can reach the end
		}
		return false;
	}

	const result = canJump(numbers) ? 1 : 0;

	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}