import type { winner } from "../../types.js";
import {
  species,
  type gameState,
  type path,
  type pathScore,
  type winMetaData,
} from "../types.js";
import { compareSpeciesInPlayArea } from "./compareSpecies.js";
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
    result = compareSpeciesInPlayArea(state.playAreaA, state.playAreaB);
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
