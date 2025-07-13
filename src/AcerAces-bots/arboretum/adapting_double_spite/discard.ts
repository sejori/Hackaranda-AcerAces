import { valueCard } from "./helpers/valueCard.js";
import { type Card, type discardMove, type playerState } from "./types.js";

export function discard(state: playerState<discardMove>) {
  const cardValues: [Card, number][] = [];

  state.hand.forEach((card) => {
    // R1
    let value = valueCard(card, state);

    cardValues.push([card, value]);
  });

  // Discard worst scoring card
  const sortedCardValues = [...cardValues].sort((a, b) => a[1] - b[1]);
  return sortedCardValues[0]![0];
}
