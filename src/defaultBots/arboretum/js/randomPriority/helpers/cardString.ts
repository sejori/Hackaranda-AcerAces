import type { Card } from "../types.js";

export function cardString(card: Card) {
  return card[0] + card[1];
}
