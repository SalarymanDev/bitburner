import { NS } from '@ns'

/** 
 * HammingCodes: Encoded Binary to Integer
 * 
 * You are given the following encoded binary string: 
 * '0010000010000000000000000101001100011010111011001010110001010110' 
 * 
 * Decode it as an 'extended Hamming code' and convert it to a decimal value.
 * The binary string may include leading zeroes.
 * A parity bit is inserted at position 0 and at every position N where N is a power of 2.
 * Parity bits are used to make the total number of '1' bits in a given set of data even.
 * The parity bit at position 0 considers all bits including parity bits.
 * Each parity bit at position 2^N alternately considers 2^N bits then ignores 2^N bits, starting at position 2^N.
 * The endianness of the parity bits is reversed compared to the endianness of the data bits:
 * Data bits are encoded most significant bit first and the parity bits encoded least significant bit first.
 * The parity bit at position 0 is set last.
 * There is a ~55% chance for an altered bit at a random index.
 * Find the possible altered bit, fix it and extract the decimal value.
 * 
 * Examples:
 * 
 * '11110000' passes the parity checks and has data bits of 1000, which is 8 in binary.
 * '1001101010' fails the parity checks and needs the last bit to be corrected to get '1001101011', after which the data bits are found to be 10101, which is 21 in binary.
 * 
 * For more information on the 'rule' of encoding, refer to Wikipedia (https://wikipedia.org/wiki/Hamming_code) or the 3Blue1Brown videos on Hamming Codes. (https://youtube.com/watch?v=X8jsijhllIA)
 */

function decodeHamming(encoded: string): number {
    const bits = encoded.split('').map(c => parseInt(c));
    const n = bits.length;
    const isParity = (pos: number) => (pos & (pos - 1)) === 0; // positions 0,1,2,4,8,...
    let syndrome = 0;
    let overallParity = 0;
    for (let i = 0; i < n; i++) {
        overallParity ^= bits[i];
    }
    for (let p = 1; p < n; p <<= 1) {
        let parity = 0;
        for (let i = 0; i < n; i++) {
            if ((i & p) !== 0) {
                parity ^= bits[i];
            }
        }
        if (parity !== 0) {
            syndrome += p;
        }
    }
    let errorPos = syndrome;
    if (syndrome === 0 && overallParity !== 0) {
        errorPos = 0;
    }
    if (errorPos !== 0 && errorPos < n) {
        bits[errorPos] ^= 1;
    }
    // Extract data bits
    const dataBits: number[] = [];
    for (let i = 0; i < n; i++) {
        if (!isParity(i)) {
            dataBits.push(bits[i]);
        }
    }
    const binary = dataBits.join('');
    return parseInt(binary, 2);
}

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const data = ns.codingcontract.getData(contractName, hostname) as string;

	const result = decodeHamming(data);

	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}