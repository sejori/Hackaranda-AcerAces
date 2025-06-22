import type { gameInterface, winner } from "../types.js";
import type { identifier } from "../../botHandler/index.js";
import { confirm } from "@inquirer/prompts";

type tile = "-" | "O" | "X";
type gameState = {
  turn: number;
  currentPlayer: number;
  state: board;
  opponent: string;
  previousTurn: false | number;
};
type board = [tile, tile, tile, tile, tile, tile, tile, tile, tile];
type move = number;
type playerState<T> = {
  token: tile;
  gameState: board;
  activeTurn: boolean;
  opponent: string;
  previousTurn: { move: T | false };
  showPreviousTurn: boolean;
};

function getInitialGameState(): gameState {
  return {
    turn: 1,
    currentPlayer: 0,
    state: ["-", "-", "-", "-", "-", "-", "-", "-", "-"],
    opponent: "",
    previousTurn: false,
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
  gameState.previousTurn = move;
  return gameState;
}

function getToken(gameState: gameState) {
  return gameState.turn % 2 ? "X" : "O";
}

function getActivePlayerState(gameState: gameState): playerState<number> {
  return {
    token: getToken(gameState),
    gameState: gameState.state,
    activeTurn: true,
    opponent: gameState.opponent,
    previousTurn: { move: gameState.previousTurn },
    showPreviousTurn: false,
  };
}

function getInactivePlayerState(gameState: gameState) {
  const currentPlayerState = getActivePlayerState(gameState);
  currentPlayerState.activeTurn = false;
  currentPlayerState.showPreviousTurn = false;
  return currentPlayerState;
}

function boardFull(board: board) {
  return board.every((tile) => tile !== "-");
}

function getWinner(gameState: gameState): winner<string> {
  if (isWinner(gameState.state)) {
    let result = (gameState.turn % 2) as 1 | 0;
    return { result, metaData: "", scoreA: 0, scoreB: 0 };
  }
  return { result: 2, metaData: "", scoreA: 0, scoreB: 0 };
}

function gameOver(gameState: gameState) {
  return isWinner(gameState.state) || boardFull(gameState.state);
}

function getRandomMove(state: playerState<number>) {
  const board = state.gameState;
  let choice = Math.floor(9 * Math.random());
  while (board[choice] !== "-") {
    choice = Math.floor(9 * Math.random());
  }
  return choice;
}

function displayForUser(
  state: playerState<number>,
  identifier: identifier,
  gameNumber: number,
  round: string,
) {
  console.clear();
  console.log(`${round}, Game ${gameNumber}`);
  console.log("Current turn:", identifier);
  if (state.opponent !== "") {
    console.log("Opponent:", state.opponent);
  }
  console.log(state.gameState);
  state.showPreviousTurn &&
    console.log("Opponent played:", map[state.previousTurn.move as number]);
}

type userMoves = "tl" | "tm" | "tr" | "ml" | "mm" | "mr" | "bl" | "bm" | "br";
const map: userMoves[] = ["tl", "tm", "tr", "ml", "mm", "mr", "bl", "bm", "br"];
function userMoveOptions(state: playerState<number>) {
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

function playerMoveValidator(state: playerState<number>) {
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
  console.clear();
  let wIdentifier = botAIdentifier;
  let lIdentifier = botBIdentifier;
  if (winner.result == 1) {
    wIdentifier = botBIdentifier;
    lIdentifier = botAIdentifier;
  }
  if (winner.result == 2) {
    console.log("It is a draw");
  } else {
    console.log(wIdentifier, "beats", lIdentifier);
  }
  console.log(state.state);
}

function postGameMessage(
  result: 0 | 1 | 2,
  scores: [number, number],
  finalState: board,
) {
  return {
    message: "ENDGAME" as "ENDGAME",
    result,
    score: scores[0],
    opponentScore: scores[1],
    finalState,
  };
}

async function showPreviousTurn(gameState: playerState<number>) {
  console.clear();
  console.log("Opponent played: ", gameState.previousTurn);
  console.log(gameState.gameState);
  await confirm({
    message: "Continue?",
  });
}

export const tictactoe: gameInterface<
  gameState,
  board,
  userMoves,
  number,
  playerState<number>,
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
  newGameMessage: (gameNumber: number, round: string) => {
    return { message: "NEWGAME", gameNumber, round };
  },
  postGameMessage,
  getWinner,
  displayForUser,
  showPreviousTurn,
  userMoveMessage: (state: playerState<number>) => {
    return "Choose move:";
  },
  userMoveTranslate,
  playerMoveValidator,
  defaultBotDetail,
  showScore,
};
