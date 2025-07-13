import { valueCard } from "./helpers/valueCard.js";
import type { move, playerState } from "./types.js";

export function randomDrawMove(state: playerState<move>) {
  const options = [];
  if (state.deck > 0) {
    // Always draw from deck if possible
    return 0;
  }
  if (state.discard.length > 0) {
    options.push(1);
  }
  if (state.opponentDiscard.length > 0) {
    options.push(2);
  }

  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

export function adaptingDraw(state: playerState<move>) {
  // early game, prioritise building hand
  let avgValue = 5;
  
  if (state.turn > 10) {
    // late game, prioritise ending it
    avgValue = 8;
  }

  const discardValue = state.discard[0] ? valueCard(state.discard[0], state) : avgValue;
  const opponentDiscardValue = state.discard[0] ? valueCard(state.discard[0], state) : avgValue;
  if (discardValue > opponentDiscardValue) return 1;
  if (opponentDiscardValue > discardValue) return 2;
  return 0;
}

