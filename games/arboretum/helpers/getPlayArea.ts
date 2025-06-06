import type { gameState } from "../types.js";

export function getCurrentPlayArea(state: gameState) {
  return state.currentPlayer === 0 ? state.playAreaA : state.playAreaB;
}

export function getOpponentPlayArea(state: gameState) {
  return state.currentPlayer === 1 ? state.playAreaA : state.playAreaB;
}
