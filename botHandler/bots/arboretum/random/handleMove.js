
export function handleMove(state) {
  return getRandomMove(state);
}

import { cardString } from "./helpers/cardString.js";

export function getRandomMove(state) {
  switch (state.subTurn) {
    case 0:
    case 1:
      return randomDrawMove(state);
    case 2:
      return randomPlayMove(state);
    case 3:
      return randomDiscardMove(state);
  }
}

function randomDrawMove(state) {
  const options = [];
  if (state.deck > 0) {
    options.push(0);
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

function randomPlayMove(state) {
  const card = pickRandomCardFromHand(state.hand);
  const coord = getRandomEmptySpace(state.playArea);
  return { card, coord };
}

function getRandomEmptySpace(playArea) {
  const toView = [[0, 0]];
  const visitedCards = new Set();
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
        return [x, y];
      }
      if (visitedCards.has(cardString(card))) {
        continue;
      }
      toView.push([x, y]);
    }
  }
  return [0, 0];
}

function pickRandomCardFromHand(hand) {
  const randomIndex = Math.floor(Math.random() * hand.length);
  return hand[randomIndex];
}

function randomDiscardMove(state) {
  return pickRandomCardFromHand(state.hand);
}
