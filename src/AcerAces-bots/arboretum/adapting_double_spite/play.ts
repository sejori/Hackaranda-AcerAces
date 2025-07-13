


import { cardString } from "./helpers/cardString.js";
import { spareCards } from "./helpers/probabilities.js";
import { scorePlayArea } from "./helpers/scoring.js";
import { valueCard } from "./helpers/valueCard.js";
import type { Card, playerState, playMove, playArea, move, coord } from "./types.js";

export function play(state: playerState<playMove>) {
  // early game: prioritise ladder
  if (state.turn < 8) {
    const rainbowResult = rainbowStaircase(state);
    if (rainbowResult) {
      return rainbowResult;
    }
  }

  // late game: prioritise scoring
  const cardValues: [Card, number][] = [];

  state.hand.forEach((card) => {
    let value = valueCard(card, state);
    cardValues.push([card, value]);
  });

  const sortedCardValues = [...cardValues].sort((a, b) => a[1] - b[1]);
  const card = sortedCardValues[0]![0];

  const emptySpaces = getAllEmptySpaces(state.playArea);
  if (typeof emptySpaces[0] === "number") {
    return { card, coord: emptySpaces };
  }

  const coord = findOptimalPlacement(card, state.playArea, emptySpaces as any);

  // const coord = pickRandomCardFromHand(emptySpaces);
  return { card, coord };
}

function getAllEmptySpaces(playArea: any) {
  const toView = [[0, 0]];
  const visitedCards = new Set();
  const emptySpaces = [];
  while (toView.length) {
    const v = toView.pop();
    const x = v![0]!;
    const y = v![1]!;

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
      const card = playArea[x!]?.[y!];
      if (card === undefined) {
        emptySpaces.push([x, y]);
        continue;
      }
      if (visitedCards.has(cardString(card))) {
        continue;
      }
      toView.push([x!, y!]);
    }
  }
  return emptySpaces;
}

function pickRandomCardFromHand(hand: any) {
  const randomIndex = Math.floor(Math.random() * hand.length);
  return hand[randomIndex];
}

function findOptimalPlacement(
  card: Card,
  playArea: playArea,
  emptySpaces: [number, number][]
) {
  let bestCoord: [number, number] = [0, 0];
  let bestScore = -Infinity;

  for (const [x, y] of emptySpaces) {
    const clonedArea = clonePlayArea(playArea);
    if (!clonedArea[x]) clonedArea[x] = {};
    clonedArea[x][y] = card;

    // Create new play area with card at coord
    const score = scorePlayArea(clonedArea, card[0]);

    if (score[0] > bestScore) {
      bestScore = score[0];
      bestCoord = [x, y];
    }
  }

  return bestCoord;
}

function clonePlayArea(area: playArea): playArea {
  const copy: playArea = {};
  for (const x in area) {
    copy[+x] = { ...area[+x] };
  }
  return copy;
}

export function rainbowStaircase(state: playerState<move>, log = false) {
  log && console.error("rainbowStaircase");
  const centerCard = state.playArea[0]?.[0];
  if (centerCard === undefined) {
    // pick centerCard to be closest to 4,5
    log && console.error("centerCard undefined");
    const rankedCards = state.hand.sort((a, b) => {
      return (a[1] - 4) ** 2 - (b[1] - 4) ** 2;
    });
    return { card: rankedCards[0] as Card, coord: [0, 0] };
  }
  const lowestEndOfStairCase = findEndOfStaircase(state.playArea);
  const highestEndOfStairCase = findEndOfStaircase(state.playArea, false);
  log && console.error({ lowestEndOfStairCase, highestEndOfStairCase });
  if (!lowestEndOfStairCase || !highestEndOfStairCase) {
    throw new Error();
  }
  const [lowestCard, lowestCoord] = lowestEndOfStairCase;
  const [highestCard, highestCoord] = highestEndOfStairCase;
  const lowTarget = lowestCard[1] - 1;
  const highTarget = highestCard[1] + 1;
  log && console.error({ lowTarget, highTarget });
  if (lowTarget < 1 && highTarget > 8) {
    return false;
  }
  const availableCards = spareCards(state, true);
  log && console.error({ availableCards });
  if (availableCards.length === 0) {
    return false;
  }
  let targetCard = availableCards[0] as Card;
  const lowCards = availableCards
    .filter((card) => card[1] <= lowTarget)
    .map((card) => [card, lowTarget - card[1]] as [Card, number])
    .sort((a, b) => a[1] - b[1]);
  const highCards = availableCards
    .filter((card) => card[1] >= highTarget)
    .map((card) => [card, card[1] - highTarget] as [Card, number])
    .sort((a, b) => a[1] - b[1]);
  log && console.error({ lowCards, highCards });
  if (lowCards.length && highCards.length) {
    if ((lowCards[0]?.[1] as number) <= (highCards[0]?.[1] as number)) {
      targetCard = lowCards[0]?.[0] as Card;
      log && console.error({ targetCard });
      return { card: targetCard, coord: lowestCoord };
    } else {
      targetCard = highCards[0]?.[0] as Card;
      log && console.error({ targetCard });
      return { card: targetCard, coord: highestCoord };
    }
  }
  if (lowCards.length) {
    targetCard = lowCards[0]?.[0] as Card;
    if ((lowCards[0]?.[1] as number) > 2) {
      return false;
    }
    log && console.error({ targetCard });
    return { card: targetCard, coord: lowestCoord };
  } else if (highCards.length) {
    targetCard = highCards[0]?.[0] as Card;
    if ((highCards[0]?.[1] as number) > 2) {
      return false;
    }
    log && console.error({ targetCard });
    return { card: targetCard, coord: highestCoord };
  }
  return false;
}

function findEndOfStaircase(
  playArea: playArea,
  lowest = true,
  log = false,
): [Card, coord] | false {
  let searched = 0;
  const directions: coord[] = lowest
    ? [
        [-1, 0],
        [0, 1],
      ]
    : [
        [0, -1],
        [1, 0],
      ];
  let current: coord = [0, 0];
  let previous: coord = [0, 0];
  log && console.error("finding", lowest ? "lowest" : "highest", "end");
  while (playArea[current[0]]?.[current[1]] !== undefined) {
    log &&
      console.error({
        card: playArea[current[0]]?.[current[1]],
        coord: current,
      });
    previous[0] = current[0];
    previous[1] = current[1];
    const nextDirection = directions[searched % 2] as coord;
    searched++;
    current[0] += nextDirection[0];
    current[1] += nextDirection[1];
  }
  if (current[0] === 0 && current[1] === 0) {
    log && console.error("empty play area");
    return false;
  }
  log &&
    console.error({ card: playArea[current[0]]?.[current[1]], coord: current });
  return [playArea[previous[0]]?.[previous[1]] as Card, current];
}
