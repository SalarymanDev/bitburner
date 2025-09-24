import { NS } from '@ns'

// Integer square root (floor) using Newton's method for BigInt
function isqrtFloor(n: bigint): bigint {
  if (n < 0n) throw new Error('Negative input not allowed');
  if (n < 2n) return n; // 0 or 1

  // Initial approximation: 1 << (bitLength(n) / 2)
  const bitLen = n.toString(2).length;
  let x0 = 1n << BigInt((bitLen + 1) >> 1); // rough upper bound
  let x1 = (x0 + n / x0) >> 1n;
  while (x1 < x0) {
    x0 = x1;
    x1 = (x0 + n / x0) >> 1n;
  }
  // x0 is the floor sqrt
  return x0;
}

// Round to nearest integer sqrt (ties round up)
function isqrtRounded(n: bigint): bigint {
  const s = isqrtFloor(n);
  const lower = s * s;
  const upper = (s + 1n) * (s + 1n);
  const dLower = n - lower;
  const dUpper = upper - n;
  // If exactly halfway or closer to upper, choose s+1
  return dUpper < dLower ? (s + 1n) : (dUpper === dLower ? (s + 1n) : s);
}

/** 
 * Square Root
 * You are given a ~200 digit BigInt. Find the square root of this number, to the nearest integer.
 * 
 * The input is a BigInt value. The answer must be the string representing the solution's BigInt value. The trailing "n" is not part of the string.
 * 
 * Hint: If you are having trouble, you might consult https://en.wikipedia.org/wiki/Methods_of_computing_square_roots
 * 
 * Input number:
 * 76836335274295528771817453962989751687331478727249924036026767686023561150569935746414784819692676981182241596708259193319381493704329088576550036820097184756972232491510164540160516769080430266565307
 */

export async function main(ns: NS): Promise<void> {
  const contractName = ns.args[0] as string;
  const hostname = ns.args[1] as string;

  const raw = ns.codingcontract.getData(contractName, hostname) as string | number | bigint;

  // Normalize to BigInt safely from string/number/bigint
  let N: bigint;
  try {
    if (typeof raw === 'bigint') {
      N = raw;
    } else if (typeof raw === 'number') {
      // Numbers may overflow, but Bitburner generally provides a string for big integers.
      // Fall back to string conversion.
      N = BigInt(raw.toString());
    } else {
      N = BigInt(raw);
    }
  } catch (e) {
    throw new Error(`Failed to parse contract input into BigInt: ${String(e)}`);
  }

  const sqrtRounded = isqrtRounded(N);
  const result = sqrtRounded.toString(); // No trailing 'n'

  const reward = ns.codingcontract.attempt(result, contractName, hostname);
  if (reward) {
    ns.tprint(`Contract solved! Reward: ${reward}`);
  } else {
    ns.tprint('Failed to solve the contract.');
  }
}