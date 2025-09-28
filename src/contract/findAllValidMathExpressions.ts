import { NS } from '@ns'

/** 
 * Find All Valid Math Expressions
 * You are given the following string which contains only digits between 0 and 9:
 * 
 * 8037725
 * 
 * You are also given a target number of 62. Return all possible ways you can add the +(add), -(subtract), and *(multiply) operators to the string such that it evaluates to the target number. (Normal order of operations applies.)
 * 
 * The provided answer should be an array of strings containing the valid expressions. The data provided by this problem is an array with two elements. The first element is the string of digits, while the second element is the target number:
 * 
 * ["8037725", 62]
 * 
 * NOTE: The order of evaluation expects script operator precedence.
 * NOTE: Numbers in the expression cannot have leading 0's. In other words, "1+01" is not a valid expression.
 * 
 * Examples:
 * 
 * Input: digits = "123", target = 6
 * Output: ["1+2+3", "1*2*3"]
 * 
 * Input: digits = "105", target = 5
 * Output: ["1*0+5", "10-5"]
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const [digits, target] = ns.codingcontract.getData(contractName, hostname) as [string, number];

	const result = findAllValidMathExpressions(digits, target);

	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}

function findAllValidMathExpressions(digits: string, target: number): string[] {
	const results: string[] = [];
	const n = digits.length;

	function backtrack(index: number, path: string, evaluated: number, prevNum: number): void {
		if (index === n) {
			if (evaluated === target) {
				results.push(path);
			}
			return;
		}

		for (let i = index; i < n; i++) {
			// Avoid numbers with leading zeros
			if (i !== index && digits[index] === '0') break;

			const currentStr = digits.substring(index, i + 1);
			const currentNum = parseInt(currentStr);

			if (index === 0) {
				// First number, pick it without any operator
				backtrack(i + 1, currentStr, currentNum, currentNum);
			} else {
				// Addition
				backtrack(i + 1, path + '+' + currentStr, evaluated + currentNum, currentNum);
				// Subtraction
				backtrack(i + 1, path + '-' + currentStr, evaluated - currentNum, -currentNum);
				// Multiplication
				backtrack(i + 1, path + '*' + currentStr, evaluated - prevNum + (prevNum * currentNum), prevNum * currentNum);
			}
		}
	}

	backtrack(0, '', 0, 0);
	return results;
}