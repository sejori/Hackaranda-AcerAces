import {
  BotProcess,
  type identifier,
} from "../turnHandlers/botHandler/index.js";
import type { gameTitle } from "../games/index.js";
import gameTypes from "../games/index.js";
import { playMatch, type matchHistory } from "../match/index.js";

export type results = {
  [botIdentifier: identifier]: number;
  draws: number;
};

export type timeouts = Record<identifier, number>;
export type scores = Record<identifier, number>;

export type bestOfResults = {
  results: results;
  timeouts: timeouts;
  scores: scores;
  bestOfHistory: matchHistory[];
};

export async function playBestOf(
  botA: BotProcess,
  botB: BotProcess,
  id: number,
  gameTitle: gameTitle,
  bestOf: number,
  round: string,
  alternatePlayer1 = true,
  log = false,
): Promise<bestOfResults> {
  log && console.log("Beginning bestOf", bestOf, "id", id);
  let gameType = gameTypes[gameTitle];

  const bestOfHistory = [];
  let results = {
    [botA.identifier]: 0,
    [botB.identifier]: 0,
    draws: 0,
  };
  let totalTimeouts = {
    [botA.identifier]: 0,
    [botB.identifier]: 0,
  };
  let totalScores = {
    [botA.identifier]: 0,
    [botB.identifier]: 0,
  };
  try {
    for (let i = 0; i < bestOf; i++) {
      if (i % 2 && alternatePlayer1) {
        [botA, botB] = [botB, botA];
      }
      const newGameMessage = gameType.newGameMessage(i + 1, round);
      await botA.send(newGameMessage);
      await botB.send(newGameMessage);

      const { result, timeouts, scores, gameState, matchHistory } =
        await playMatch(botA, botB, i, gameTitle, log);
      bestOfHistory.push(matchHistory);
      const [scoreA, scoreB] = scores;
      if (scoreA === undefined || scoreB === undefined) {
        throw new Error();
      }
      let aResult: 0 | 1 | 2 = 0;
      let bResult: 0 | 1 | 2 = 0;
      if (result === 2) {
        results.draws++;
        aResult = 2;
        bResult = 2;
      } else if (result === 0) {
        (results[botA.identifier] as number) += 1;
        aResult = 0;
        bResult = 1;
      } else if (result === 1) {
        (results[botB.identifier] as number) += 1;
        aResult = 1;
        bResult = 0;
      }
      (totalTimeouts[botA.identifier] as number) +=
        timeouts[botA.identifier] ?? 0;
      (totalTimeouts[botB.identifier] as number) +=
        timeouts[botB.identifier] ?? 0;
      (totalScores[botA.identifier] as number) += scoreA;
      (totalScores[botB.identifier] as number) += scoreB;
      const postGameMessage = gameType.postGameMessage;
      await botA.send(postGameMessage(aResult, [scoreA, scoreB], gameState));
      await botB.send(postGameMessage(bResult, [scoreB, scoreA], gameState));
    }
  } catch (error) {
    log && console.error(error);
  } finally {
    log &&
      console.log(
        "Bestof ID",
        id,
        "Player 1 won:",
        results[botA.identifier],
        "Player 2 won:",
        results[botB.identifier],
        "Draws: ",
        results.draws,
        "Played: ",
        (results[botB.identifier] as number) +
          (results[botA.identifier] as number) +
          results.draws,
      );
    return {
      results,
      timeouts: totalTimeouts,
      scores: totalScores,
      bestOfHistory,
    };
  }
}
