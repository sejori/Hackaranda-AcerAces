import { getCardsByPriority, spareCards } from "./probabilities.js";
import type { Hand, move, playerState } from "./types.js";

function pickRandomCardFromHand(hand: Hand) {
  const randomIndex = Math.floor(Math.random() * hand.length);
  return hand[randomIndex];
}

export function discardMove(state: playerState<move>) {
  return getCardsByPriority(state.hand)[0];
}
