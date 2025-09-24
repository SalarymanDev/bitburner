import { NS } from '@ns'

/**
 * Compression II: LZ Decompression
 * 
 * Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to earlier parts of the data. In this variant of LZ, data is encoded in two types of chunk. Each chunk begins with a length L, encoded as a single ASCII digit from 1 to 9, followed by the chunk data, which is either:
 * 
 * 1. Exactly L characters, which are to be copied directly into the uncompressed data.
 * 2. A reference to an earlier part of the uncompressed data. To do this, the length is followed by a second ASCII digit X: each of the L output characters is a copy of the character X places before it in the uncompressed data.
 * 
 * For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character is the start of a new chunk. The two chunk types alternate, starting with type 1, and the final chunk may be of either type.
 * 
 * You are given the following LZ-encoded string:
 * 	6v1NIbS954HHH3648gskBAknT192Fv588dHF5X3kn222gN753sc1724xfne3436ab676lbex60
 * Decode it and output the original string.
 * 
 * Example: decoding '5aaabb450723abb' chunk-by-chunk
 * 
 * 	5aaabb           ->  aaabb
 * 	5aaabb45         ->  aaabbaaab
 * 	5aaabb450        ->  aaabbaaab
 * 	5aaabb45072      ->  aaabbaaababababa
 * 	5aaabb450723abb  ->  aaabbaaababababaabb
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const input = ns.codingcontract.getData(contractName, hostname) as string;
	
	const result = decompressLZ(input);
	
	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}

function decompressLZ(encoded: string): string {
	let i = 0;
	let isLiteral = true; // chunk types alternate, starting with type 1 (literal)
	const out: string[] = []; // stores individual characters

	while (i < encoded.length) {
		const ch = encoded[i++];
		if (ch < '0' || ch > '9') {
			throw new Error(`Invalid length digit '${ch}' at position ${i - 1}`);
		}
		const L = ch.charCodeAt(0) - 48; // '0' => 0

		// Zero-length chunk: immediately flip type and continue
		if (L === 0) {
			isLiteral = !isLiteral;
			continue;
		}

		if (isLiteral) {
			// Copy L literal characters directly
			if (i + L > encoded.length) {
				throw new Error(`Literal overruns input at position ${i - 1}`);
			}
			for (let t = 0; t < L; t++) {
				out.push(encoded[i + t]);
			}

			i += L;
		} else {
			// Backref: next digit is X (1..9); for L times, copy char X positions back
			if (i >= encoded.length) {
				throw new Error(`Missing backref distance at position ${i}`);
			}
			const xd = encoded[i++];
			if (xd < '1' || xd > '9') {
				throw new Error(`Invalid backref distance '${xd}' at position ${i - 1}`);
			}
			const X = xd.charCodeAt(0) - 48;
			for (let k = 0; k < L; k++) {
				if (out.length < X) {
					throw new Error(`Backref exceeds available history: need ${X}, have ${out.length}`);
				}
				const c = out[out.length - X];
				out.push(c);
			}
		}

		// After completing a non-zero chunk, flip chunk type
		isLiteral = !isLiteral;
	}

	return out.join('');
}