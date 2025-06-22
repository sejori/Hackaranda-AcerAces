import type { gameInterface } from "../types.js";
import { defaultBotDetail } from "./botDetail.js";
import { gameOver } from "./endgame/gameOver.js";
import { getWinner } from "./endgame/winner.js";
import { applyMove } from "./move/apply.js";
import { getRandomMove } from "./move/random.js";
import { isValidMove } from "./move/validate.js";
import { getInitialGameState } from "./state/initial.js";
import {
  getActivePlayerState,
  getInactivePlayerState,
} from "./state/player.js";
import type {
  gameState,
  move,
  playerState,
  userMove,
  winMetaData,
} from "./types.js";
import {
  displayForUser,
  showPreviousTurn,
  userMoveMessage,
} from "./userPlayer/display.js";
import { userMoveTranslate } from "./userPlayer/moveTranslator.js";
import { playerMoveValidator } from "./userPlayer/moveValidator.js";
import { showScore } from "./userPlayer/showScore.js";

function postGameMessage(
  result: 0 | 1 | 2,
  scores: [number, number],
  finalState: gameState,
) {
  return {
    message: "ENDGAME" as "ENDGAME",
    result,
    score: scores[0],
    opponentScore: scores[1],
    finalState,
  };
}

export const arboretum: gameInterface<
  gameState,
  gameState,
  userMove,
  move,
  playerState<move>,
  winMetaData
> = {
  getInitialGameState,
  players: 2,
  getActivePlayerState,
  getInactivePlayerState,
  gameOver,
  getWinner,
  isValidMove,
  applyMove,
  getRandomMove,
  displayForUser,
  showPreviousTurn,
  userMoveMessage,
  userMoveTranslate,
  playerMoveValidator,
  defaultBotDetail,
  postGameMessage,
  newGameMessage: (gameNumber: number, round: string) => {
    return { message: "NEWGAME", gameNumber, round };
  },
  showScore,
};
