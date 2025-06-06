import { subTurn, type gameState } from "../types.js";

export function gameOver(state: gameState) {
  return state.deck.length === 0 && state.subTurn === subTurn.FirstDraw;
}
