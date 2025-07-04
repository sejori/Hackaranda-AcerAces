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
import { getRightToPlay } from "./rightToPlay.js";
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
