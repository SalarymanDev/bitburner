import { NS } from '@ns'

/** 
 * Proper 2-Coloring of a Graph
 * You are attempting to solve a Coding Contract. You have 5 tries remaining, after which the contract will self-destruct.
 * 
 * You are given the following data, representing a graph:
 * [9,[[0,4],[2,8],[6,7],[2,7],[0,3],[1,8],[0,5],[5,6],[2,3],[4,6]]]
 * Note that "graph", as used here, refers to the field of graph theory, and has no relation to statistics or plotting.
 * The first element of the data represents the number of vertices in the graph. Each vertex is a unique number between 0 and 8.
 * The next element of the data represents the edges of the graph. Two vertices u,v in a graph are said to be adjacent if there exists an edge [u,v].
 * Note that an edge [u,v] is the same as an edge [v,u], as order does not matter.
 * You must construct a 2-coloring of the graph, meaning that you have to assign each vertex in the graph a "color", either 0 or 1, such that no two adjacent vertices have the same color.
 * Submit your answer in the form of an array, where element i represents the color of vertex i. If it is impossible to construct a 2-coloring of the given graph, instead submit an empty array.
 * 
 * Examples:
 * Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]
 * Output: [0, 0, 1, 1]
 * 
 * Input: [3, [[0, 1], [0, 2], [1, 2]]]
 * Output: []
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 * 
 * run contract/graphTwoColoring.js contract-384850-OmniTekIncorporated.cct silver-helix
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const input = ns.codingcontract.getData(contractName, hostname);

	const numVertices = input[0] as number;
	const edges = input[1] as number[][];
	const graph: Map<number, number[]> = new Map();

	for (let i = 0; i < numVertices; i++) {
		graph.set(i, []);
	}

	for (const [u, v] of edges) {
		graph.get(u)?.push(v);
		graph.get(v)?.push(u);
	}

	const colors: number[] = new Array(numVertices).fill(-1);

	function bfs(start: number): boolean {
		const queue: number[] = [start];
		colors[start] = 0;

		while (queue.length > 0) {
			const node = queue.shift() as number;
			const currentColor = colors[node];
			const nextColor = 1 - currentColor;

			for (const neighbor of graph.get(node) as number[]) {
				if (colors[neighbor] === -1) {
					colors[neighbor] = nextColor;
					queue.push(neighbor);
				} else if (colors[neighbor] === currentColor) {
					return false;
				}
			}
		}
		return true;
	}

	let isBipartite = true;
	for (let i = 0; i < numVertices; i++) {
		if (colors[i] === -1) {
			if (!bfs(i)) {
				isBipartite = false;
				break;
			}
		}
	}

	const results = isBipartite ? colors : [];

	const reward = ns.codingcontract.attempt(results, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}