import { NS } from '@ns'

/** 
 * Generate IP Addresses
 * Given the following string containing only digits, return an array with all possible valid IP address combinations that can be created from the string:
 * 
 * 14917434222
 * 
 * Note that an octet cannot begin with a '0' unless the number itself is exactly '0'. For example, '192.168.010.1' is not a valid IP.
 * 
 * Examples:
 * 
 * 25525511135 -> ["255.255.11.135", "255.255.111.35"]
 * 1938718066 -> ["193.87.180.66"]
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const digits = ns.codingcontract.getData(contractName, hostname) as string;


	function isValidOctet(octet: string): boolean {
		if (octet.length === 0 || octet.length > 3) return false;
		if (octet[0] === '0' && octet.length > 1) return false; // Leading zero
		const num = parseInt(octet, 10);
		return num >= 0 && num <= 255;
	}

	function backtrack(start: number, path: string[], result: string[]) {
		if (path.length === 4 && start === digits.length) {
			result.push(path.join('.'));
			return;
		}
		if (path.length === 4 || start === digits.length) {
			return;
		}

		for (let len = 1; len <= 3; len++) {
			if (start + len > digits.length) break;
			const octet = digits.substring(start, start + len);
			if (isValidOctet(octet)) {
				path.push(octet);
				backtrack(start + len, path, result);
				path.pop();
			}
		}
	}

	const result: string[] = [];
	backtrack(0, [], result);

	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}

