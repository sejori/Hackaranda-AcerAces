import { cardString } from "./helpers/cardString.js";
export function randomPlayMove(state) {
  const card = pickRandomCardFromHand(state.hand);
  const emptySpaces = getAllEmptySpaces(state.playArea);
  if (typeof emptySpaces[0] === "number") {
    console.error({ card, coord: emptySpaces});
    return { card, coord: emptySpaces};
  }
  const coord = pickRandomCardFromHand(
    getAllEmptySpaces(state.playArea),
  );
  return { card, coord };
}

function getAllEmptySpaces(playArea) {
  const toView = [[0, 0]];
  const visitedCards = new Set();
  const emptySpaces = [];
  while (toView.length) {
    const [x, y] = toView.pop();
    let card = playArea[x]?.[y];
    if (card === undefined) return [x, y];
    visitedCards.add(cardString(card));

    let coordOptions= [
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
