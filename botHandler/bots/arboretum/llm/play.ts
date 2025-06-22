import { scorePlayArea } from "./helpers/scoring.js";
import { cardString } from "./helpers/cardString.js";
import {
  type coord,
  type move,
  type playerState,
  type playArea,
  type Card,
  species,
} from "./types.js";
import { spareCards } from "./probabilities.js";

export function playMove(state: playerState<move>) {
  const stair = rainbowStaircase(state);
  if (stair !== false) {
    return stair;
  }
  return playBestImmediateMove(state);
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

export function playBestImmediateMove(state: playerState<move>) {
  let highestScore = -Infinity;
  const availableCards = spareCards(state, true);
  let bestCard = availableCards[0];
  let bestCoord: coord = [0, 0];
  if (state.playArea[0]?.[0] === undefined) {
    return { card: bestCard, coord: bestCoord };
  }
  const coords = getAllEmptySpaces(state.playArea) as coord[];
  bestCoord = coords[0] as coord;
  for (let card of availableCards) {
    for (let coord of coords) {
      const newPlayArea = placeCardInPlayArea(
        state.playArea,
        card,
        coord[0],
        coord[1],
      );
      let score = 0;
      for (let aSpecies of species) {
        const [speciesScore, _] = scorePlayArea(newPlayArea, aSpecies);
        score += speciesScore;
      }
      if (score > highestScore) {
        highestScore = score;
        bestCard = card;
        bestCoord = coord;
      }
    }
  }
  return { card: bestCard, coord: bestCoord };
}

function placeCardInPlayArea(
  playArea: playArea,
  newCard: Card,
  newX: number,
  newY: number,
) {
  const newPlayArea = {};
  for (let x of Object.keys(playArea)) {
    const row = playArea[Number(x)] as playArea[number];
    for (let y of Object.keys(row)) {
      const card = row[Number(y)] as Card;
      playAreaInsert(newPlayArea, card, Number(x), Number(y));
    }
  }
  playAreaInsert(newPlayArea, newCard, newX, newY);
  return newPlayArea;
}

function playAreaInsert(playArea: playArea, card: Card, x: number, y: number) {
  const row = playArea[x];
  if (row == undefined) {
    playArea[x] = {};
  }
  (playArea[x] as playArea[number])[y] = card;
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
