import { NS } from '@ns'

/**
 * Compression III: LZ Compression
 * 
 * Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to earlier parts of the data.
 * In this variant of LZ, data is encoded in two types of chunk. Each chunk begins with a length L, encoded as a single ASCII digit from 1 to 9, followed by the chunk data, which is either:
 * 
 * 1. Exactly L characters, which are to be copied directly into the uncompressed data.
 * 2. A reference to an earlier part of the uncompressed data. To do this, the length is followed by a second ASCII digit X: each of the L output characters is a copy of the character X places before it in the uncompressed data.
 * 
 * For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character is the start of a new chunk.
 * The two chunk types alternate, starting with type 1, and the final chunk may be of either type.
 * 
 * You are given the following input string:
 *   MYArIolR7BTMgR7GMdqGRSLMdqGRSLM6YDbCbCbCbVfCb5eeeeeeeTYCeeeeeJLeJLerqAqAqAqBQAqAqBAqAqBABAUEzbO3
 * Encode it using Lempel-Ziv encoding with the minimum possible output length.
 * 
 * Examples (some have other possible encodings of minimal length):
 *   abracadabra     ->  7abracad47
 *   mississippi     ->  4miss433ppi
 *   aAAaAAaAaAA     ->  3aAA53035
 *   2718281828      ->  627182844
 *   abcdefghijk     ->  9abcdefghi02jk
 *   aaaaaaaaaaaa    ->  3aaa91
 *   aaaaaaaaaaaaa   ->  1a91031
 *   aaaaaaaaaaaaaa  ->  1a91041
*/

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const input = ns.codingcontract.getData(contractName, hostname) as string;
	
	const result = compressLZ(input);
	
	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}

function compressLZ(input: string): string {
	// We want the shortest possible encoding under the described alternating-chunk LZ scheme.
	// Chunks alternate types: type 0 = literal, type 1 = backref. Start with type 0.
	// Each chunk begins with a single digit L (0-9). L=0 switches to the next chunk type without consuming input.
	// Literal: output digit L (1..9) + L literal chars.
	// Backref: output digit L (1..9) + digit X (1..9) where for k in [0..L-1], s[i+k] == s[i-X+k]. Requires i>=X.
	// Final chunk may be either type.

	type MemoKey = string;
	type DPResult = string | null; // encoded suffix or null if impossible

	const n = input.length;

	// Compare two encodings: prefer shorter; if equal length, lexicographically smaller for determinism.
	function better(a: DPResult, b: DPResult): DPResult {
		if (a === null) return b;
		if (b === null) return a;
		if (a.length !== b.length) return a.length < b.length ? a : b;
		return a <= b ? a : b;
	}

	// Memoization over (i, type, canZero)
	const memo = new Map<MemoKey, DPResult>();

	function key(i: number, type: number, canZero: number): MemoKey {
		return `${i}|${type}|${canZero}`;
	}

	function dp(i: number, type: 0 | 1, canZero: boolean): DPResult {
		const k = key(i, type, canZero ? 1 : 0);
		const cached = memo.get(k);
		if (cached !== undefined) return cached;

		let best: DPResult = null;

		// If we've consumed all input, we're done. We are allowed to end on either chunk type.
		if (i === n) {
			best = "";
			memo.set(k, best);
			return best;
		}

		if (type === 0) {
			// Literal chunk options
			// Option: emit a literal of length L in [1..9], staying within bounds
			for (let L = 1; L <= 9 && i + L <= n; L++) {
				const literal = input.slice(i, i + L);
				const rest = dp(i + L, 1, true);
				if (rest !== null) {
					const enc = `${L}${literal}${rest}`;
					best = better(best, enc);
				}
			}
			// Option: emit a zero-length chunk to switch type (avoid consecutive zeros)
			if (canZero) {
				const rest = dp(i, 1, false);
				if (rest !== null && (i === n ? false : rest !== "")) {
					const enc = `0${rest}`;
					best = better(best, enc);
				}
			}
		} else {
			// Backref chunk options
			// Try all X in [1..9] where i - X >= 0 (enough history)
			for (let X = 1; X <= 9; X++) {
				if (i - X < 0) continue;
				// Compute the max match length at this X
				let maxL = 0;
				while (maxL < 9 && i + maxL < n) {
					if (input[i + maxL] !== input[i - X + maxL]) break;
					maxL++;
				}
				for (let L = 1; L <= maxL; L++) {
					const rest = dp(i + L, 0, true);
					if (rest !== null) {
						const enc = `${L}${X}${rest}`;
						best = better(best, enc);
					}
				}
			}
			// Option: zero-length chunk to switch back to literal (avoid consecutive zeros)
			if (canZero) {
				const rest = dp(i, 0, false);
				if (rest !== null && rest !== "") {
					const enc = `0${rest}`;
					best = better(best, enc);
				}
			}
		}

		memo.set(k, best);
		return best;
	}

	const ans = dp(0, 0, true);
	return ans ?? "";
}