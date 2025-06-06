
/** Handles move
 * @param {('O'|"X"|"-")[]} board - An array of 9 'O'|"X"|"-" tokens representing the tictactoe board
 * @param {'O'|'X'|'-'} token - Token to be placed
 * @returns {number} - Index of token placement
 */
export function handleMove(board, token) {
  if (isFirstTurn(board)) return 0;
  let choice = Math.floor(9 * Math.random());
  while (board[choice] !== "-") {
    choice = Math.floor(9 * Math.random());
  }
  return choice;
}

/**
 * @param {('O'|'X'|'-')[]} board 
  */
function isFirstTurn(board) {
  return board.every(token => token == '-');
}
