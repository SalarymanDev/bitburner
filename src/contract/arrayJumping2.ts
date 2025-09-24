import { NS } from '@ns'

/** 
 * Array Jumping Game II
 * You are attempting to solve a Coding Contract. You have 3 tries remaining, after which the contract will self-destruct.
 * 
 * You are given the following array of integers:
 * 3,6,7,2,1,2,5,3,4,1,4,3,3,5,2,1,2,0,3,3
 * 
 * Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.
 * 
 * Assuming you are initially positioned at the start of the array, determine the minimum number of jumps to reach the end of the array.
 * 
 * If it's impossible to reach the end, then the answer should be 0.
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 * 
 * run contract/arrayJumping2.js contract-246231-Sector12.cct neo-net
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const data = ns.codingcontract.getData(contractName, hostname) as number[];

	const jumps = calculateMinimumJumps(data);
	const reward = ns.codingcontract.attempt(jumps, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}

function calculateMinimumJumps(data: number[]): number {
	let jumps = 0;
	let currentEnd = 0;
	let farthest = 0;

	for (let i = 0; i < data.length - 1; i++) {
		farthest = Math.max(farthest, i + data[i]);
		if (i === currentEnd) {
			jumps++;
			currentEnd = farthest;
			if (currentEnd >= data.length - 1) break;
		}
	}

	return currentEnd >= data.length - 1 ? jumps : 0;
}