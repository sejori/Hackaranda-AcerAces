import type { Card, Hand, move, playArea, playerState, species } from "../types.js";

export function cardString(card: Card) {
	return card[0] + card[1];
}

const enable18Rule = false;

function getAllEmptySpaces(playArea: playArea) {
  const toView = [[0, 0]];
  const visitedCards = new Set();
  const emptySpaces = [];
  while (toView.length) {
    // @ts-ignore
    const [x, y] = toView.pop();
    let card = playArea[x]?.[y];
    if (card === undefined) return [x, y];
    visitedCards.add(cardString(card));

    let coordOptions = [
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

function pickRandomCardFromHand(hand: Hand) {
  const randomIndex = Math.floor(Math.random() * hand.length);
  return hand[randomIndex];
}

function randomDiscardMove(state: playerState<move>) {
  return pickRandomCardFromHand(state.hand);
}

export function spitefulDiscard(state: playerState<move>) {
  // Keep 1s and 8s

  let cards = state.hand;
  if (enable18Rule) {
    const not1Or8 = state.hand.filter((x) => x[1] !== 1 && x[1] !== 8);

    if (not1Or8.length == 0) {
      // Only have 1/8s. Random Discard
      return randomDiscardMove(state);
    }

    cards = not1Or8;
  }

  // Discard a card not present in opponents player area
  const cardsNotPresentInOpponentsPA = [];
  for (let i = 0; i < cards.length; i++) {
    // @ts-ignore
    if (!containsSpecies(state.opponentPlayArea, cards[i][0])) {
      // @ts-ignore
      cardsNotPresentInOpponentsPA.push(state.hand[i]);
    }
  }

  if (cardsNotPresentInOpponentsPA.length > 0) {
    const minSubarray = cardsNotPresentInOpponentsPA.reduce((min, current) => {
      // @ts-ignore
      return current[1] < min[1] ? current : min;
    });
    return minSubarray;
  }

  // Select min card to discard
  const minSubarray = cards.reduce((min, current) => {
    // @ts-ignore
    return current[1] < min[1] ? current : min;
  });
  return minSubarray;
}

function containsSpecies(playerArea: playArea, letter: species) {
  // Iterate through all the outer keys in data
  for (const outerKey in playerArea) {
    const innerObj = playerArea[outerKey];

    // Iterate through all the inner keys in the nested objects
    for (const innerKey in innerObj) {
      // @ts-ignore
      const [species] = innerObj[innerKey]; // Get the species (letter)

      // Check if the species matches the letter
      if (species === letter) {
        return true; // If letter is found, return true
      }
    }
  }

  return false; // If letter is not found, return false
}
