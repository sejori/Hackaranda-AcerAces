import type { UUID } from "crypto";
import type { gameInterface, winner } from "../types.js";
import type { identifier } from "../../botHandler/index.js";

type tile = "-" | "O" | "X";
type gameState = {
  turn: number;
  currentPlayer: number;
  state: board;
  opponent: string;
};
type board = [tile, tile, tile, tile, tile, tile, tile, tile, tile];
type move = number;
type playerState = {
  token: tile;
  gameState: board;
  activeTurn: boolean;
  opponent: string;
};

function getInitialGameState(): gameState {
  return {
    turn: 1,
    currentPlayer: 0,
    state: ["-", "-", "-", "-", "-", "-", "-", "-", "-"],
    opponent: "",
  };
}

function isWinner(state: board) {
  for (let i = 0; i < 3; i++) {
    if (
      state[0 + i * 3] == state[1 + i * 3] &&
      state[1 + i * 3] == state[2 + i * 3] &&
      state[0 + i * 3] !== "-"
    )
      return true;
    if (
      state[0 + i] == state[3 + i] &&
      state[3 + i] == state[6 + i] &&
      state[0 + i] !== "-"
    )
      return true;
  }
  const dia1 = state[0] == state[4] && state[4] == state[8] && state[0] !== "-";
  const dia2 = state[2] == state[4] && state[4] == state[6] && state[2] !== "-";
  return dia1 || dia2;
}

function isValidMove(gameState: gameState, move: move) {
  if (move > 9 || move < 0) return false;
  return gameState.state[move] == "-";
}

function applyMove(gameState: gameState, move: move) {
  const token = getToken(gameState);
  gameState.state[move] = token;
  gameState.turn += 1;
  gameState.currentPlayer = gameState.currentPlayer == 0 ? 1 : 0;
  return gameState;
}

function getToken(gameState: gameState) {
  return gameState.turn % 2 ? "X" : "O";
}

function getActivePlayerState(gameState: gameState): playerState {
  return {
    token: getToken(gameState),
    gameState: gameState.state,
    activeTurn: true,
    opponent: gameState.opponent,
  };
}

function getInactivePlayerState(gameState: gameState) {
  const currentPlayerState = getActivePlayerState(gameState);
  currentPlayerState.activeTurn = false;
  return currentPlayerState;
}

function boardFull(board: board) {
  return board.every((tile) => tile !== "-");
}

function getWinner(gameState: gameState): winner<string> {
  if (isWinner(gameState.state)) {
    let result = (gameState.turn % 2) as 1 | 0;
    return { result, metaData: "" };
  }
  return { result: 2, metaData: "" };
}

function gameOver(gameState: gameState) {
  return isWinner(gameState.state) || boardFull(gameState.state);
}

function getRandomMove(state: playerState) {
  const board = state.gameState;
  let choice = Math.floor(9 * Math.random());
  while (board[choice] !== "-") {
    choice = Math.floor(9 * Math.random());
  }
  return choice;
}

function displayForUser(state: playerState, identifier: identifier) {
  console.clear();
  console.log("Current turn:", identifier);
  if (state.opponent !== "") {
    console.log("Opponent:", state.opponent);
  }
  console.log(state.gameState);
}

type userMoves = "tl" | "tm" | "tr" | "ml" | "mm" | "mr" | "bl" | "bm" | "br";
function userMoveOptions(state: playerState) {
  const map: userMoves[] = [
    "tl",
    "tm",
    "tr",
    "ml",
    "mm",
    "mr",
    "bl",
    "bm",
    "br",
  ];
  const validMoves = [];
  const board = state.gameState;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "-") {
      validMoves.push(i);
    }
  }
  return validMoves.map((move) => map[move]);
}

function userMoveTranslate(move: userMoves) {
  const map = { tl: 0, tm: 1, tr: 2, ml: 3, mm: 4, mr: 5, bl: 6, bm: 7, br: 8 };
  return map[move];
}

function playerMoveValidator(state: playerState) {
  const options = userMoveOptions(state);
  return function (choice: userMoves[number]) {
    if (!options.includes(choice as userMoves)) {
      return "Expected one of " + options;
    }
    return true;
  };
}

function defaultBotDetail(botNumber: number) {
  return {
    dockerId: "tictactoe-random-bot",
    identifier: "Random bot " + (botNumber + 1),
  };
}

function showScore(
  state: gameState,
  winner: winner<any>,
  botAIdentifier: identifier,
  botBIdentifier: identifier,
) {
  let wIdentifier = botAIdentifier;
  let lIdentifier = botBIdentifier;
  if (winner.result == 1) {
    wIdentifier = botBIdentifier;
    lIdentifier = botAIdentifier;
  } else if (winner.result == 2) {
    console.log("It is a draw");
  }
  console.log(wIdentifier, "beats", lIdentifier);
}

export const tictactoe: gameInterface<
  gameState,
  userMoves,
  number,
  playerState,
  any
> = {
  getInitialGameState,
  players: 2,
  gameOver,
  isValidMove,
  applyMove,
  getRandomMove,
  getActivePlayerState,
  getInactivePlayerState,
  newGameMessage: (gameNumber: number) => {
    return { message: "NEWGAME", gameNumber };
  },
  getWinner,
  displayForUser,
  userMoveMessage: (state: playerState) => {
    return "Choose move:";
  },
  userMoveTranslate,
  playerMoveValidator,
  defaultBotDetail,
  showScore,
};
