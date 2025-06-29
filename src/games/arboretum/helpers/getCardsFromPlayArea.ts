import type { Card, playArea } from "../types.js";

export function getCardsFromPlayArea(playArea: playArea) {
  const cards: Card[] = [];
  for (let row of Object.values(playArea)) {
    for (let card of Object.values(row)) {
      cards.push(card);
    }
  }
  return cards;
}
