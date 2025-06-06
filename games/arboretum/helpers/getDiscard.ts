import type { gameState } from "../types.js";

export function getCurrentDiscard(state: gameState) {
  return state.currentPlayer === 0 ? state.discardA : state.discardB;
}

export function getOpponentDiscard(state: gameState) {
  return state.currentPlayer === 1 ? state.discardA : state.discardB;
}
