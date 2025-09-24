import { NS } from '@ns'

/** 
 * Sanitize Parentheses in Expression
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * 
 * Given the following string:
 * ((a))a((()())()a)
 * 
 * remove the minimum number of invalid parentheses in order to validate the string. If there are multiple minimal ways to validate the string, provide all of the possible results.
 * The answer should be provided as an array of strings. If it is impossible to validate the string the result should be an array with only an empty string.
 * 
 * IMPORTANT: The string may contain letters, not just parentheses.
 * 
 * Examples:
 * "()())()" -> ["()()()", "(())()"]
 * "(a)())()" -> ["(a)()()", "(a())()"]
 * ")(" -> [""]
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 * 
 * run contract/sanitizeParenthesis.js contract-541828-NiteSec.cct The-Cave
 */

function isValid(s: string): boolean {
  let count = 0;
  for (const c of s) {
    if (c === '(') count++;
    else if (c === ')') {
      count--;
      if (count < 0) return false;
    }
  }
  return count === 0;
}

function sanitizeParentheses(s: string): string[] {
  const result: string[] = [];
  const visited = new Set<string>();
  const queue: string[] = [s];
  visited.add(s);
  let found = false;
  while (queue.length > 0 && !found) {
    const size = queue.length;
    const levelResult: string[] = [];
    for (let i = 0; i < size; i++) {
      const curr = queue.shift() as string;
      if (isValid(curr)) {
        levelResult.push(curr);
      } else {
        for (let j = 0; j < curr.length; j++) {
          if (curr[j] === '(' || curr[j] === ')') {
            const next = curr.slice(0, j) + curr.slice(j + 1);
            if (!visited.has(next)) {
              visited.add(next);
              queue.push(next);
            }
          }
        }
      }
    }
    if (levelResult.length > 0) {
      result.push(...levelResult);
      found = true;
    }
  }
  if (result.length === 0) return [""];
  return result;
}

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const input = ns.codingcontract.getData(contractName, hostname) as string;

	const results = sanitizeParentheses(input);

	const reward = ns.codingcontract.attempt(results, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}