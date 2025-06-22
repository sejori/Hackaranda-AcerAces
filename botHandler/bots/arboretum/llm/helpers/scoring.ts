import type { Card, coord, path, playArea } from "../types.js";
import { species } from "../types.js";
import { cardString } from "./cardString.js";

export function totalScore(playArea: playArea) {
  let totalScore = 0;
  for (let aSpecies of species) {
    const score = scorePlayArea(playArea, aSpecies);
    totalScore += score[0];
  }
  return totalScore;
}
export function scorePlayArea(
  playArea: playArea,
  species: species,
): [number, path[]] {
  let highestScore = 0;
  let bestPaths: path[] = [];
  if (playArea[0]?.[0] === undefined) {
    return [0, []];
  }
  const cardsOfSpecies = getAllCardsOfSpecies(playArea, species);
  for (let [_, coord] of cardsOfSpecies) {
    let [score, path] = getScoreFromStartingCard(playArea, coord, species);
    if (score > highestScore) {
      bestPaths = [...path];
      highestScore = score;
    } else if (score == highestScore) {
      bestPaths.push(...path);
    }
  }
  return [highestScore, bestPaths];
}

function scorePath(path: path, species: species) {
  if (path.length === 1) {
    return 0;
  }
  const firstCard = path[0] as Card;
  const lastCard = path[path.length - 1] as Card;
  if (firstCard[0] !== species || lastCard[0] !== species) {
    return 0;
  }
  let score = path.length;
  const sameSpecies = path.every((card) => card[0] == species);
  const pathLength = path.length;

  if (sameSpecies && pathLength >= 4) {
    score += path.length;
  }

  if (firstCard[1] === 1) {
    score += 1;
  }

  if (lastCard[1] === 8) {
    score += 2;
  }

  return score;
}

type searchTrack = {
  path: path;
  coord: coord;
  visitedCards: Set<string>;
};
function getScoreFromStartingCard(
  playArea: playArea,
  startCardCoord: coord,
  species: species,
): [number, path[]] {
  let searchTrackStack: searchTrack[] = [
    { path: [], coord: startCardCoord, visitedCards: new Set() },
  ];
  let highestScore = 0;
  let bestPath: path[] = [];
  while (searchTrackStack.length) {
    const searchTrack = searchTrackStack.pop();
    if (searchTrack === undefined) {
      throw new Error("search track undefined");
    }
    const { path, coord, visitedCards } = searchTrack;
    const [x, y] = coord;
    const card = playArea[x]?.[y];
    if (card === undefined) {
      throw new Error("card is undefined");
    }
    visitedCards.add(cardString(card));
    path.push(card);

    // Check score
    const score = scorePath(path, species);
    if (score > highestScore) {
      highestScore = score;
      bestPath = [path];
    } else if (score == highestScore) {
      bestPath.push(path);
    }

    // Decide which cards to visit
    let coordOptions: coord[] = [
      [x, y + 1],
      [x, y - 1],
      [x + 1, y],
      [x - 1, y],
    ];
    for (let [x, y] of coordOptions) {
      const nextCard = playArea[x]?.[y];
      if (nextCard === undefined || visitedCards.has(cardString(nextCard))) {
        continue;
      }
      if (nextCard[1] <= card[1]) {
        continue;
      }
      searchTrackStack.push({
        path: [...path],
        coord: [x, y],
        visitedCards: new Set(visitedCards),
      });
    }
  }
  return [highestScore, bestPath];
}

function getAllCardsOfSpecies(playArea: playArea, species: species) {
  let coordStack: coord[] = [[0, 0]];
  const startCard = cardString(playArea[0]?.[0] as Card);
  let visitedCards = new Set();
  visitedCards.add(startCard);
  let cardsOfSpecies: [Card, coord][] = [];
  while (coordStack.length) {
    const newCoord = coordStack.pop();
    if (newCoord === undefined) {
      throw new Error("new coord failed");
    }
    const [x, y] = newCoord;
    const card = playArea[x]?.[y];
    if (card === undefined) {
      continue;
    }
    if (card[0] === species) {
      cardsOfSpecies.push([card, [x, y]]);
    }

    // Decide which cards to visit
    let coordOptions: coord[] = [
      [x, y + 1],
      [x, y - 1],
      [x + 1, y],
      [x - 1, y],
    ];
    for (let [x, y] of coordOptions) {
      const card = playArea[x]?.[y];
      if (card === undefined || visitedCards.has(cardString(card))) {
        continue;
      }
      coordStack.push([x, y]);
      visitedCards.add(cardString(card));
    }
  }
  return cardsOfSpecies;
}
