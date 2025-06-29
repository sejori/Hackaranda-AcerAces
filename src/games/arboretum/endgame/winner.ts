import type { winner } from "../../types.js";
import { getCardsFromPlayArea } from "../helpers/getCardsFromPlayArea.js";
import {
  species,
  type gameState,
  type Hand,
  type path,
  type pathScore,
  type winMetaData,
} from "../types.js";
import { scorePlayArea } from "./scoring.js";

export function getWinner(state: gameState): winner<winMetaData> {
  let playerAScore = 0;
  let playerAPaths: pathScore[] = [];
  let playerBScore = 0;
  let playerBPaths: pathScore[] = [];

  let rightToPlay: number[] = [];
  for (let i = 0; i < species.length; i++) {
    const aSpecies = species[i] as species;
    rightToPlay = getRightToPlay(
      [state.handA, state.handB],
      aSpecies as species,
    );

    for (let player of rightToPlay) {
      let playArea = state.playAreaA;
      if (player === 1) {
        playArea = state.playAreaB;
      }
      const [score, bestPaths] = scorePlayArea(playArea, aSpecies) as [
        number,
        path[],
      ];
      if (player === 0) {
        playerAScore += score;
        playerAPaths.push({
          path: bestPaths[0] || [],
          score,
          species: aSpecies,
          scored: true,
        });
      } else {
        playerBScore += score;
        playerBPaths.push({
          path: bestPaths[0] || [],
          score,
          species: aSpecies,
          scored: true,
        });
      }
    }
  }

  let result: 0 | 1 | 2 = 2;
  if (playerAScore > playerBScore) {
    result = 0;
  } else if (playerBScore > playerAScore) {
    result = 1;
  }

  if (result === 2) {
    const speciesCountA = speciesInHand(getCardsFromPlayArea(state.playAreaA));
    const speciesCountB = speciesInHand(getCardsFromPlayArea(state.playAreaB));
    if (speciesCountA > speciesCountB) {
      result = 0;
    } else if (speciesCountB > speciesCountA) {
      result = 1;
    }
  }

  const res = {
    result,
    metaData: {
      aScore: playerAScore,
      aPaths: playerAPaths,
      bScore: playerBScore,
      bPaths: playerBPaths,
    },
    scoreA: playerAScore,
    scoreB: playerBScore,
  };
  return res;
}

function speciesInHand(hand: Hand) {
  const speciesSet = new Set<species>();
  let count = 0;
  for (let card of hand) {
    const [aSpecies, rank] = card;
    if (!speciesSet.has(aSpecies)) {
      speciesSet.add(aSpecies);
      count++;
    }
  }
  return count;
}

function getRightToPlay(hands: Hand[], targetSpecies: species) {
  let has8 = -1;
  let has1 = -1;
  const scores = [];
  for (let i = 0; i < hands.length; i++) {
    const hand = hands[i] as Hand;
    const score = hand.reduce((acc, card) => {
      const [species, rank] = card;
      if (species == targetSpecies) {
        if (rank === 8) {
          has8 = i;
        } else if (rank === 1) {
          has1 = i;
        }
        return acc + rank;
      }
      return acc;
    }, 0);
    scores.push(score);
  }

  if (has1 !== -1 && has1 !== has8) {
    scores[has8] = (scores[has8] as number) - 8;
  }

  let winners: number[] = [];
  let highestScore = 0;
  for (let i = 0; i < scores.length; i++) {
    const score = scores[i] as number;
    if (score > highestScore) {
      highestScore = score;
      winners = [i];
    } else if (score == highestScore) {
      winners.push(i);
    }
  }

  return winners;
}
