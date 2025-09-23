import { NS } from '@ns'

/** 
 * Spiralize Matrix
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * 
 * Given the following array of arrays of numbers representing a 2D matrix, return the elements of the matrix as an array in spiral order:
 *     [
 *         [45,20,37,11,31,28, 7]
 *         [ 1,24,38,21, 5, 8,26]
 *         [16,31,37,27,38,39,28]
 *         [39,21,39,38, 9,38, 1]
 *     ]
 * 
 * Here is an example of what spiral order should be:
 *     [
 *         [1, 2, 3]
 *         [4, 5, 6]
 *         [7, 8, 9]
 *     ]
 * Answer: [1, 2, 3, 6, 9, 8 ,7, 4, 5]
 * 
 * Note that the matrix will not always be square:
 *     [
 *         [1,  2,  3,  4]
 *         [5,  6,  7,  8]
 *         [9, 10, 11, 12]
 *     ]
 * Answer: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const matrix = ns.codingcontract.getData(contractName, hostname) as number[][];
	const result: number[] = [];
	if (matrix.length === 0) {
		ns.tprint(result);
		return;
	}

	let top = 0;
	let bottom = matrix.length - 1;
	let left = 0;
	let right = matrix[0].length - 1;

	while (top <= bottom && left <= right) {
		// Traverse from left to right
		for (let col = left; col <= right; col++) {
			result.push(matrix[top][col]);
		}
		top++;

		// Traverse from top to bottom
		for (let row = top; row <= bottom; row++) {
			result.push(matrix[row][right]);
		}
		right--;

		if (top <= bottom) {
			// Traverse from right to left
			for (let col = right; col >= left; col--) {
				result.push(matrix[bottom][col]);
			}
			bottom--;
		}

		if (left <= right) {
			// Traverse from bottom to top
			for (let row = bottom; row >= top; row--) {
				result.push(matrix[row][left]);
			}
			left++;
		}
	}

	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}