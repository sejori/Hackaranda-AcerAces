/**
 * @param {('O'|"X"|"-")[]} board - An array of 9 'O'|"X"|"-" tokens representing the tictactoe board
 * @param {'O'|'X'|'-'} token - Token to be placed
 * @returns {number} - Index of token placement
 */
export function handleMove(board, token) {
	// Check if there's a win this turn
	const opponentsToken = token == 'X' ? 'O' : 'X';
	const losses = [];
	for (let i = 0; i < board.length; i++) {
		const tokenAtIndex = board[i];
		if (tokenAtIndex !== '-') {
			continue;
		}
		const updatedBoard = insertToken(i, board, token);
		if (isWinner(updatedBoard)) return i;
		const updatedLossBoard = insertToken(i, board, opponentsToken);
		if (isWinner(updatedLossBoard)) {
			losses.push(i);
		}
	}
	if (losses.length) {
		return losses[0];
	}
	return randomMove(board);
}

function randomMove(board) {
	let choice = Math.floor(9 * Math.random());
	while (board[choice] !== '-') {
		choice = Math.floor(9 * Math.random());
	}
	return choice;
}

/**
 * Inserts token and returns a copy of the board
 * @param {('O'|'X'|'-')[]} board
 * @param {'O'|'X'|'-'} token - Token to be placed
 * @param {number} index - Index to place token
 */
function insertToken(index, board, token) {
	// TODO: Insert validity check but for now assume it's valid
	const boardCopy = [...board];
	boardCopy[index] = token;
	return boardCopy;
}

/**
 * @param {('O'|'X'|'-')[]} board
 */
function isWinner(board) {
	for (let i = 0; i < 3; i++) {
		if (
			board[0 + i * 3] == board[1 + i * 3] &&
			board[1 + i * 3] == board[2 + i * 3] &&
			board[0 + i * 3] !== '-'
		)
			return true;
		if (
			board[0 + i] == board[3 + i] &&
			board[3 + i] == board[6 + i] &&
			board[0 + i] !== '-'
		)
			return true;
	}
	const dia1 = board[0] == board[4] && board[4] == board[8] && board[0] !== '-';
	const dia2 = board[2] == board[4] && board[4] == board[6] && board[2] !== '-';
	return dia1 || dia2;
}
