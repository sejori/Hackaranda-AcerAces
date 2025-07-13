import type {
  Card,
  Hand,
  opponentHand,
  playArea,
  playerState,
  species,
} from "../types.js";
import { scorePlayArea } from "./scoring.js";

const rankCardsScale = 1;
const activeThwartScale = 1;
const speciesSumMinus = 3;

export function valueCard(card: Card, state: playerState<any>) {
  let value = rankCard(card, state) * rankCardsScale;
  value += activeThwart(card, state) * activeThwartScale;

  const speciesSum = speciesRankSum(card, state);

  if (speciesSum > 12) {
    value -= speciesSumMinus;
  }

  return value;
}

function rankCard(card: Card, state: playerState<any>) {
  if (card[1] == 1) {
    // If opponent has 8 in hand, we want our 1
    const the8: Card = [card[0], 8];
    if (hasCardInHand(state.opponentHand, the8)) {
      return 10;
    }

    // If opponent played 8 in play area 1 just worth its rank
    if (hasCardInPlayArea(state.opponentPlayArea, the8)) {
      return 1;
    }

    // Else it may be useful later
    return 7;
  }

  if (card[1] == 8) {
    // If opponent has 1 in hand, 8 is worthless
    const the1: Card = [card[0], 1];
    if (hasCardInHand(state.opponentHand, the1)) {
      return 0;
    }

    return 11; // Accouting for 2 bonus points
  }

  return card[1];
}

function activeThwart(card: Card, state: playerState<any>) {
  const opScore = scorePlayArea(state.opponentPlayArea, card[0]);
  return opScore[0];
}

function speciesRankSum(card: Card, state: playerState<any>) {
  const cards = state.hand.filter((x) => x[0] === card[0]);
  let sum = 0;

  cards.forEach((x) => {
    sum += rankCard(x, state);
  });

  return sum;
}

function hasCardInHand(hand: opponentHand, card: Card) {
  return hand
    .filter((x) => x !== null)
    .some(([species, rank]) => species === card[0] && rank === card[1]);
}

function hasCardInPlayArea(playArea: playArea, card: Card) {
  // Iterate over each row in the play area
  for (const row of Object.values(playArea)) {
    for (const cell of Object.values(row)) {
      if (cell[0] === card[0] && cell[1] === card[1]) {
        return true; // Card is found in the play area
      }
    }
  }
  return false; // Card is not found in the play area
}
