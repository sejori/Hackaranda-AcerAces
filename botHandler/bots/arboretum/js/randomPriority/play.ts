import { cardString } from "./helpers/cardString.js";
import {
  type coord,
  type move,
  type playerState,
  type playArea,
  type Card,
  species,
  type Hand,
} from "./types.js";
import { getCardsByPriority, spareCards } from "./probabilities.js";

export function randomPlayMove(state: playerState<move>) {
  const card = pickRandomCardFromHand(getCardsByPriority(state.hand));
  const emptySpaces = getAllEmptySpaces(state.playArea);
  if (typeof emptySpaces[0] === "number") {
    return { card, coord: emptySpaces as coord };
  }
  const coord = pickRandomCardFromHand(
    getAllEmptySpaces(state.playArea) as coord[],
  );
  return { card, coord };
}
function pickRandomCardFromHand(hand: Hand | coord[]) {
  const randomIndex = Math.floor(Math.random() * hand.length);
  return hand[randomIndex] as Card;
}

function getAllEmptySpaces(playArea: playArea) {
  const toView: coord[] = [[0, 0]];
  const visitedCards = new Set<string>();
  const emptySpaces: coord[] = [];
  while (toView.length) {
    const [x, y] = toView.pop() as coord;
    let card = playArea[x]?.[y];
    if (card === undefined) return [x, y] as coord;
    visitedCards.add(cardString(card));

    let coordOptions: coord[] = [
      [x, y + 1],
      [x, y - 1],
      [x + 1, y],
      [x - 1, y],
    ];
    for (let [x, y] of coordOptions) {
      const card = playArea[x]?.[y];
      if (card === undefined) {
        emptySpaces.push([x, y]);
        continue;
      }
      if (visitedCards.has(cardString(card))) {
        continue;
      }
      toView.push([x, y]);
    }
  }
  return emptySpaces;
}
