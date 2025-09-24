import { NS } from '@ns'

/** 
 * Total Ways to Sum II
 * A Bitburner Coding Contract: Given a target and a set of integers, compute how many
 * DISTINCT combinations (order does not matter) can sum to the target. Each integer
 * may be used zero or more times.
 *
 * Input format from the contract API (ns.codingcontract.getData):
 *   Either [target, [n1, n2, n3, ...]] or [target, n1, n2, n3, ...]
 *
 * Approach:
 *   Classic unbounded coin-change (combinations) dynamic programming.
 *   Let dp[s] = number of ways to make sum s. Initialize dp[0] = 1.
 *   For each number v in the set (outer loop), for s from v..target: dp[s] += dp[s - v].
 *   Using numbers in the outer loop ensures combinations are counted without regard to order.
 */


export async function main(ns: NS): Promise<void> {
  const contractName = ns.args[0] as string;
  const hostname = ns.args[1] as string;
  const input = ns.codingcontract.getData(contractName, hostname) as unknown;

  let target: number;
  let numbers: number[];

  if (Array.isArray(input) && typeof input[0] === 'number' && Array.isArray((input as any)[1])) {
    // Format: [target, [n1, n2, ...]]
    target = input[0] as number;
    numbers = ((input as any)[1] as number[]).slice();
  } else if (Array.isArray(input) && input.length >= 2 && typeof input[0] === 'number') {
    // Format: [target, n1, n2, ...]
    target = input[0] as number;
    numbers = (input as number[]).slice(1);
  } else {
    ns.tprint('Invalid input: expected [target, [numbers]] or [target, ...numbers]');
    return;
  }

  const ways = countWays(numbers, target);

  const reward = ns.codingcontract.attempt(ways, contractName, hostname);
  if (reward) {
    ns.tprint(`Contract solved! Reward: ${reward}`);
  } else {
    ns.tprint('Failed to solve the contract.');
  }
}

function countWays(numbers: number[], target: number): number {
  // Defensive handling
  if (target < 0) return 0;
  if (target === 0) return 1;

  // Normalize: remove non-positive and duplicates
  const uniq = Array.from(new Set(numbers.filter((n) => Number.isFinite(n) && n > 0)));
  uniq.sort((a, b) => a - b);

  const dp = new Array<number>(target + 1).fill(0);
  dp[0] = 1;

  for (const v of uniq) {
    for (let s = v; s <= target; s++) {
      dp[s] += dp[s - v];
    }
  }
  return dp[target];
}