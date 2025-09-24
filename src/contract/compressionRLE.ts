import { NS } from '@ns'

/** 
 * Compression I: RLE Compression
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * 
 * Run-length encoding (RLE) is a data compression technique which encodes data as a series of runs of a repeated single character. Runs are encoded as a length, followed by the character itself. Lengths are encoded as a single ASCII digit; runs of 10 characters or more are encoded by splitting them into multiple runs.
 * 
 * You are given the following input string:
 *     gRRRRRRRppppS22222oddA7eeEEEEEEEEEEEEEEFFFFFFFFFFFFQQ77Ess8vv5jjjjxxHH55FFU00000000
 * Encode it using run-length encoding with the minimum possible output length.
 * 
 * Examples:
 * 
 *     aaaaabccc            ->  5a1b3c
 *     aAaAaA               ->  1a1A1a1A1a1A
 *     111112333            ->  511233
 *     zzzzzzzzzzzzzzzzzzz  ->  9z9z1z  (or 9z8z2z, etc.)
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostName = ns.args[1] as string;
	const input = ns.codingcontract.getData(contractName, hostName);

	const maxCount = 9;
	let result = '';
	let i = 0;
	while (i < input.length) {
		const currentCharacter = input[i];
		let count = 0;
		while (currentCharacter === input[i] && count < maxCount) {
			++count;
			++i;
		}
		result += `${count}${currentCharacter}`
	}

	const reward = ns.codingcontract.attempt(result, contractName, hostName);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}