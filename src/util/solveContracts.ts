import { NS } from '@ns'
import { NetworkScanner } from '/lib/NetworkScanner';


const contractTypeToSolverMap = new Map<string, string>([
	['Total Ways to Sum', '/contract/totalWaysToSum.js'],
	['Minimum Path Sum in a Triangle', '/contract/minimumPathSumInATriangle.js'],
	['Compression I: RLE Compression', '/contract/compressionRLE.js'],
	['Compression II: LZ Decompression', '/contract/lzDecompression.js'],
	['Compression III: LZ Compression', '/contract/compressionLZ.js'],
	['Sanitize Parentheses in Expression', '/contract/sanitizeParenthesis.js'],
	['Array Jumping Game', '/contract/arrayJumping.js'],
	['Array Jumping Game II', '/contract/arrayJumping2.js'],
	['Encryption I: Caesar Cipher', '/contract/caesarCipher.js'],
	['Encryption II: Vigenère Cipher', '/contract/vigenereCipher.js'],
	['Spiralize Matrix', '/contract/spiralizeMatrix.js'],
	['Unique Paths in a Grid I', '/contract/uniquePathsInGrid1.js'],
	['Unique Paths in a Grid II', '/contract/uniquePathsInGrid2.js'],
	['Algorithmic Stock Trader I', '/contract/stockTrader1.js'],
	['Algorithmic Stock Trader II', '/contract/stockTrader2.js'],
	['Algorithmic Stock Trader III', '/contract/stockTrader3.js'],
	['Algorithmic Stock Trader IV', '/contract/stockTrader4.js'],
	['Find Largest Prime Factor', '/contract/largestPrimeFactor.js'],
	['HammingCodes: Integer to Encoded Binary', '/contract/hammingCodesIntegerToBinary.js'],
	['HammingCodes: Encoded Binary to Integer', '/contract/hammingCodesBinaryToInteger.js'],
	['Total Ways to Sum', '/contract/totalWaysToSum.js'],
	['Total Ways to Sum II', '/contract/totalWaysToSum2.js'],
	['Shortest Path in a Grid', '/contract/shortestPathInGrid.js'],
	['Square Root', '/contract/squareRoot.js'],
	['Subarray with Maximum Sum', '/contract/subarrayWithMaximumSum.js'],
	['Generate IP Addresses', '/contract/generateIPAddresses.js'],
	['Proper 2-Coloring of a Graph', '/contract/graphTwoColoring.js'],
	['Merge Overlapping Intervals', '/contract/mergeOverlappingIntervals.js'],
]);

export async function main(ns : NS) : Promise<void> {
	const scanner = new NetworkScanner(ns);
    const network = [...scanner.getNetwork()];
	let contractsFound = 0;
	for (const host of network) {
		const contracts = ns.ls(host, '.cct');
		contractsFound += contracts.length;
		if (contracts.length === 0) continue;
		for (const contractName of contracts) {
			const contract = ns.codingcontract.getContract(contractName, host);
			if (contractTypeToSolverMap.has(contract.type)) {
				// ns.tprint(`Solving ${contract.type} on ${host}`);
				const pid = ns.exec(contractTypeToSolverMap.get(contract.type), 'home', undefined, contractName, host);
				// ns.tprint(`Started solver with PID ${pid}`);
			} else {
				ns.tprint(`No solver for ${contract.type}`);
				ns.tprint(`Host: ${host} File: ${contractName}`);
				ns.tprint(`Type: ${contract.type}`);
				ns.tprint(`Description: ${contract.description}\n\n`);
			}
		}
	}

	ns.tprint(`Contracts found: ${contractsFound}`);
}