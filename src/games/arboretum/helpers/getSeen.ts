import type { gameState } from "../types.js";

export function getCurrentSeen(state: gameState) {
  return state.currentPlayer === 0 ? state.seenA : state.seenB;
}

export function getOpponentSeen(state: gameState) {
  return state.currentPlayer === 1 ? state.seenA : state.seenB;
}
