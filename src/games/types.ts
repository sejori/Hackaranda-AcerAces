import type { UUID } from "node:crypto";
import type { identifier } from "../botHandler/index.js";
import type { botDetail } from "../tournaments/types.js";

/** player */
export type player = {
  returnURL: string;
  playerID: string;
  playerNumber: number;
};

export type tournamentPlayer = {
  returnURL: string;
  apiKey: string;
};

/** Games */
export type gameType = "arboretum";

/** code to be passed assign game */
export type gamecode = string;

/** apiKey */
export type apiKey = string;

/** game passcode */
export type passcode = string;

/** playerID */
export type playerID = string;

export type gameSettings = {
  passcode: gamecode;
  gameType: gameType;
  players: player[];
};

export type gameState = {
  turn: number;
  currentPlayer: number;
  opponent: string;
};

export type playerState<S> = {
  activeTurn: boolean;
  previousTurn: { move: S | false; metaData?: any };
  showPreviousTurn: boolean;
};

export type request<S> = {
  messageID: UUID;
  state: S;
};
export type response<S> = {
  messageID: UUID;
  move: S;
};

export type winner<S> = {
  result: 0 | 1 | 2;
  metaData: S;
  scoreA: number;
  scoreB: number;
};

export type gameInterface<
  S extends gameState,
  internalState,
  userMove,
  move,
  T extends playerState<move>,
  Q,
> = {
  /**
   * Set initial gameState
   */
  getInitialGameState: () => S;

  /**
   *  Number of players
   */
  players: number;
  /**
   * Checks if the game has finished, a win or a draw
   */
  gameOver: (gameState: S) => boolean;
  /**
   * Verifies given move is for the given gameState
   */
  isValidMove: (gameState: S, move: move) => boolean;
  /**
   * Applies move to the gameState
   */
  applyMove: (gameState: S, move: move) => S;
  /**
   * Returns a random valid move. Used for example when a player timesout.
   */
  getRandomMove: (gameState: T) => move;
  /**
   * Get state for active player
   */
  getActivePlayerState: (gameState: S) => T;
  /**
   * Get state for inactive player
   */
  getInactivePlayerState: (gameState: S) => T;
  /**
   * newGameMessage
   */
  newGameMessage: (
    gameNumber: number,
    round: string,
  ) => {
    gameNumber: number;
    round: string;
    message: "NEWGAME";
  };
  /**
   * postGameMessage
   */
  postGameMessage: (
    result: 0 | 1 | 2,
    scores: [number, number],
    finalState: internalState,
  ) => {
    message: "ENDGAME";
    result: 0 | 1 | 2;
    score: number;
    opponentScore: number;
    finalState: internalState;
  };
  /**
   * Return 0 for draw, 1 for active player win, 2 for inactive player win
   */
  getWinner: (gameState: S) => winner<Q>;

  /**
   * Print current state in a human friendly way
   */
  displayForUser: (
    gameState: T,
    identifier: string,
    gameNumber: number,
    round: string,
  ) => void;
  /**
   * Show previousTurn and wait for user confirmation
   */
  showPreviousTurn: (
    gameState: T,
    gameNumber: number,
    round: string,
  ) => Promise<void>;
  /**
   * Print message to prompt user for current move
   */
  userMoveMessage: (gameState: T) => string;
  /**
   * Translate a human friendly move to a normal move
   */
  userMoveTranslate: (userMove: userMove, gameState: T) => move;
  /**
   * Returns a validator that validates humand readable move against the current state
   */
  playerMoveValidator: (state: T) => (choice: userMove) => string | true;
  /**
   *
   */
  showScore: (
    state: S,
    winner: winner<Q>,
    botAIdentifier: identifier,
    botBIdentifier: identifier,
  ) => void;
  /**
   * Returns the default bot information (usually random)
   */
  defaultBotDetail: (botNumber: number) => botDetail;
};
