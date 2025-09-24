import { NS } from '@ns'

/** 
 * HammingCodes: Integer to Encoded Binary
 * You are given the following decimal value:
 * 38
 * 
 * Convert it to a binary representation and encode it as an 'extended Hamming code'.
 * The number should be converted to a string of '0' and '1' with no leading zeroes.
 * A parity bit is inserted at position 0 and at every position N where N is a power of 2.
 * Parity bits are used to make the total number of '1' bits in a given set of data even.
 * The parity bit at position 0 considers all bits including parity bits.
 * Each parity bit at position 2^N alternately considers 2^N bits then ignores 2^N bits, starting at position 2^N.
 * The endianness of the parity bits is reversed compared to the endianness of the data bits:
 * Data bits are encoded most significant bit first and the parity bits encoded least significant bit first.
 * The parity bit at position 0 is set last.
 * 
 * Examples:
 * 
 * 8 in binary is 1000, and encodes to 11110000 (pppdpddd - where p is a parity bit and d is a data bit)
 * 21 in binary is 10101, and encodes to 1001101011 (pppdpdddpd)
 * 
 * For more information on the 'rule' of encoding, refer to Wikipedia (https://wikipedia.org/wiki/Hamming_code) or the 3Blue1Brown videos on Hamming Codes. (https://youtube.com/watch?v=X8jsijhllIA)
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const input = ns.codingcontract.getData(contractName, hostname) as number;

	const binaryString = input.toString(2);
	const dataBits = binaryString.split('').map(bit => parseInt(bit, 10));

	const totalBits = dataBits.length;

	// Compute total length including parity at 0 and at powers of two (1,2,4,...).
	let totalLength = totalBits;
	while (true) {
		const parityPositions = new Set<number>([0]);
		for (let p = 1; p < totalLength; p <<= 1) {
			parityPositions.add(p);
		}
		const dataSlots = totalLength - parityPositions.size;
		if (dataSlots >= totalBits) break;
		totalLength++;
	}

	// Build encoded array and place data bits (MSB first).
	const encodedArray: number[] = new Array<number>(totalLength).fill(0);
	const parityPositions = new Set<number>([0]);
	for (let p = 1; p < totalLength; p <<= 1) {
		parityPositions.add(p);
	}

	let dataIndex = 0;
	for (let i = 0; i < totalLength; i++) {
		if (!parityPositions.has(i)) {
			encodedArray[i] = dataBits[dataIndex++];
		}
	}

	// Compute parity bits for positions 1,2,4,... (even parity for each set)
	for (let p = 1; p < totalLength; p <<= 1) {
		let count = 0;
		for (let j = p; j < totalLength; j += (p << 1)) {
			for (let k = 0; k < p && (j + k) < totalLength; k++) {
				count += encodedArray[j + k];
			}
		}
		// Set parity so the covered set (including this parity bit) has an even number of 1s
		encodedArray[p] = count % 2;
	}

	// Overall parity at position 0: even parity across all bits (including other parity bits)
	const sumExcludingP0 = encodedArray.slice(1).reduce((acc, bit) => acc + bit, 0);
	encodedArray[0] = sumExcludingP0 % 2;

	const encoding = encodedArray.join('');

	const reward = ns.codingcontract.attempt(encoding, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}