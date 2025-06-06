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
import { displayForUser, userMoveMessage } from "./userPlayer/display.js";
import { userMoveTranslate } from "./userPlayer/moveTranslator.js";
import { playerMoveValidator } from "./userPlayer/moveValidator.js";
import { showScore } from "./userPlayer/showScore.js";

export const arboretum: gameInterface<
  gameState,
  userMove,
  move,
  playerState,
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
  userMoveMessage,
  userMoveTranslate,
  playerMoveValidator,
  defaultBotDetail,
  newGameMessage: (gameNumber: number) => {
    return { message: "NEWGAME", gameNumber };
  },
  showScore,
};
