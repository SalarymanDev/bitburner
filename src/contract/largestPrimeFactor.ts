import { NS } from '@ns'

/** 
 * Find Largest Prime Factor
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * 
 * A prime factor is a factor that is a prime number. What is the largest prime factor of 955711612?
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 * 
 * run contract/largestPrimeFactor.js contract-128875-NiteSec.cct titan-labs
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;

	const input = ns.codingcontract.getData(contractName, hostname) as number;
	const largestPrimeFactor = calculateLargestPrimeFactor(input);	

	const reward = ns.codingcontract.attempt(largestPrimeFactor, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}

function calculateLargestPrimeFactor(n: number): number {
	let largestFactor = -1;

	// Check for number of 2s that divide n
	while (n % 2 === 0) {
		largestFactor = 2;
		n /= 2;
	}

	// n must be odd at this point, so we can skip even numbers
	for (let i = 3; i <= Math.sqrt(n); i += 2) {
		while (n % i === 0) {
			largestFactor = i;
			n /= i;
		}
	}

	// This condition is to check if n is a prime number greater than 2
	if (n > 2) {
		largestFactor = n;
	}

	return largestFactor;
}