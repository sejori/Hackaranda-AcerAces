import type { Card, coord, playArea } from "../types.js";

export function checkLocationInPlayArea(
  playArea: playArea,
  unvalidatedCard: Card,
) {
  for (let x of Object.keys(playArea)) {
    let row = playArea[Number(x)];
    if (row === undefined) {
      continue;
    }
    for (let y of Object.keys(row)) {
      let card = row[Number(y)];
      if (card === undefined) {
        continue;
      }
      if (
        card[0] == unvalidatedCard[0].toUpperCase() &&
        card[1] == unvalidatedCard[1]
      ) {
        return [Number(x), Number(y)] as coord;
      }
    }
  }
  return false;
}
