import { cardString } from "./helpers/cardString.js";

const enable18Rule = false;

export function handleMove(state) {
  switch (state.subTurn) {
    case 0:
    case 1:
      return randomDrawMove(state);
    case 2:
      return randomPlayMove(state);
    case 3:
      return discard(state);
  }
}

export function randomPlayMove(state) {
  const card = pickRandomCardFromHand(state.hand);
  const emptySpaces = getAllEmptySpaces(state.playArea);
  if (typeof emptySpaces[0] === "number") {
    return { card, coord: emptySpaces };
  }
  const coord = pickRandomCardFromHand(getAllEmptySpaces(state.playArea));
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

function randomDrawMove(state) {
  const options = [];
  if (state.deck > 0) {
    // Prefer deck pickup over discard
    return 0;
    // options.push(0);
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

function pickRandomCardFromHand(hand) {
  const randomIndex = Math.floor(Math.random() * hand.length);
  return hand[randomIndex];
}

function randomDiscardMove(state) {
  return pickRandomCardFromHand(state.hand);
}

function discard(state) {
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
    if (!containsSpecies(state.opponentPlayArea)) {
      cardsNotPresentInOpponentsPA.push(state.hand[i]);
    }
  }

  if (cardsNotPresentInOpponentsPA.length > 0) {
    const minSubarray = cardsNotPresentInOpponentsPA.reduce((min, current) => {
      return current[1] < min[1] ? current : min;
    });
    return minSubarray;
  }

  // Select min card to discard
  const minSubarray = cards.reduce((min, current) => {
    return current[1] < min[1] ? current : min;
  });
  return minSubarray;
}

function containsSpecies(playerArea, letter) {
  // Iterate through all the outer keys in data
  for (const outerKey in playerArea) {
    const innerObj = playerArea[outerKey];

    // Iterate through all the inner keys in the nested objects
    for (const innerKey in innerObj) {
      const [species] = innerObj[innerKey]; // Get the species (letter)

      // Check if the species matches the letter
      if (species === letter) {
        return true; // If letter is found, return true
      }
    }
  }

  return false; // If letter is not found, return false
}
