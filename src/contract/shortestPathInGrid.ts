import { NS } from '@ns'

/** 
 * Shortest Path in a Grid
 * You are located in the top-left corner of the following grid:
 * 
 * [[0,0,0,0,1,0,0,0,1,1,0,1],
 * [0,0,0,0,0,1,0,1,0,1,1,0],
 * [0,0,0,0,0,0,0,0,0,0,0,1],
 * [0,0,0,0,0,1,1,1,0,1,0,0],
 * [0,0,0,0,0,0,1,0,1,1,0,0],
 * [0,0,0,1,1,0,0,0,1,0,0,1],
 * [1,0,0,1,0,1,0,1,0,1,1,0],
 * [0,0,0,1,1,0,0,1,0,0,0,0],
 * [0,0,0,0,1,0,1,1,0,0,1,0],
 * [0,1,1,1,0,0,0,0,0,1,0,0],
 * [1,0,0,0,0,1,1,0,0,0,0,0]]
 * 
 * You are trying to find the shortest path to the bottom-right corner of the grid, but there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.
 * 
 * Determine the shortest path from start to finish, if one exists. The answer should be given as a string of UDLR characters, indicating the moves along the path
 * 
 * NOTE: If there are multiple equally short paths, any of them is accepted as answer. If there is no path, the answer should be an empty string.
 * NOTE: The data returned for this contract is an 2D array of numbers representing the grid.
 * 
 * Examples:
 * 	[[0,1,0,0,0],
 * 	[0,0,0,1,0]]
 * 
 * Answer: 'DRRURRD'
 * 	[[0,1],
 * 	[1,0]]
 * 
 * Answer: ''
 */

export async function main(ns : NS) : Promise<void> {
	const contractName = ns.args[0] as string;
	const hostname = ns.args[1] as string;
	const grid = ns.codingcontract.getData(contractName, hostname) as number[][];

	const result = findShortestPath(grid);

	const reward = ns.codingcontract.attempt(result, contractName, hostname);
	if (reward) {
		ns.tprint(`Contract solved! Reward: ${reward}`);
	} else {
		ns.tprint('Failed to solve the contract.');
	}
}

function findShortestPath(grid: number[][]): string {
	const numRows = grid.length;
	const numCols = grid[0].length;

	// Directions: (row change, col change, character)
	const directions: [number, number, string][] = [
		[-1, 0, 'U'],
		[1, 0, 'D'],
		[0, -1, 'L'],
		[0, 1, 'R']
	];

	// BFS setup
	const queue: {row: number, col: number, path: string}[] = [];
	const visited = Array.from({length: numRows}, () => Array(numCols).fill(false));

	// Start from top-left corner if it's not an obstacle
	if (grid[0][0] === 1) return '';
	queue.push({row: 0, col: 0, path: ''});
	visited[0][0] = true;

	while (queue.length > 0) {
		const {row, col, path} = queue.shift()!;

		// Check if we've reached the bottom-right corner
		if (row === numRows - 1 && col === numCols - 1) {
			return path;
		}

		// Explore neighbors
		for (const [dRow, dCol, move] of directions) {
			const newRow = row + dRow;
			const newCol = col + dCol;

			// Check bounds and obstacles
			if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols &&
				grid[newRow][newCol] === 0 && !visited[newRow][newCol]) {
				visited[newRow][newCol] = true;
				queue.push({row: newRow, col: newCol, path: path + move});
			}
		}
	}

	// No path found
	return '';
}