import { cardString } from "./helpers/cardString.js";
import { scorePlayArea } from "./helpers/scoring.js";
import { valueCard } from "./helpers/valueCard.js";
import type { Card, Hand, playerState, playMove, playArea } from "./types.js";

export function play(state: playerState<playMove>) {
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
