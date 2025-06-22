/** Handles move
 * @param {('O'|"X"|"-")[]} board - An array of 9 'O'|"X"|"-" tokens representing the tictactoe board
 * @param {'O'|'X'|'-'} token
 * @returns {number} - Index of token placement
 */
export function handleMove(board, token) {
	const mappedBoard = mapBoard(board);
	const move = perfectMove(mappedBoard, 1, token === 'X' ? 1 : 2);
	return move;
}

function mapBoard(board) {
	return board
		.map(tile => {
			if (tile === '-') {
				return '0';
			} else if (tile === 'O') {
				return '2';
			} else {
				return '1';
			}
		})
		.join('');
}

function perfectMove(board, firstTurn, currentTurn = firstTurn, depth = 0) {
	// Min-max algorithm
	// Calculate the best move assuming your opponent will play the best move by rating a win by +1, a draw as +0 and a loss as -1
	// When summing up at the end, on our turn pick the best move for us, on the opponent's turn pick the best move for the,
	if (typeof board === 'string') board = board.split('').map(el => Number(el)); // TODO: Check if still needed
	let res = [];
	res.push(currentTurn === firstTurn ? -Infinity : Infinity); // We'll either look for largest or smallest number given whose turn it is
	const possibleMoves = [];
	const state = [...board];
	for (let i = 0; i < 9; i++) {
		// Calculate all places we can go
		if (state[i] === 0) possibleMoves.push(i);
	}
	for (let move of possibleMoves) {
		// Loop through those moves (a draw will have no possible moves so we don't loop)
		let total = 0;
		let newBoard = [...board];
		newBoard[move] = currentTurn;
		const win = checkWin(newBoard);
		if (win) {
			// Recursive end case
			if (currentTurn === firstTurn) total = 1; // we win
			else total = -1; // we lose
		} else {
			total = perfectMove(
				newBoard,
				firstTurn,
				currentTurn === 1 ? 2 : 1,
				depth + 1,
			); // Recursively check the next move until there's a win or a draw
		}
		if (currentTurn === firstTurn) {
			// We only get here if there's been a win so we need to update res
			if (res[0] < total) res = [total, move]; // It's our go so update res if we get a better result for us
		} else {
			if (res[0] > total) res = [total, move]; // It's their go so update res if it's a worse result for us
		}
	}
	if (depth === 0) return res[1]; // Return index if on surface level
	if (res[0] === Infinity || res[0] === -Infinity) return 0; // Account for draws
	return res[0]; // Otherwise return total from this level
}
function pickMove(state) {
	let choice = Math.floor(9 * Math.random());
	while (state[choice] !== '-') {
		choice = Math.floor(9 * Math.random());
	}
	return choice;
}

function checkWin(board) {
	// Check if there's a win by cycling through all possible combinations
	const wins = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let win of wins) {
		if (`${board[win[0]]}` === '0') {
			continue;
		}
		if (board[win[0]] === board[win[1]] && board[win[0]] === board[win[2]]) {
			return true;
		}
	}
	return false;
}
