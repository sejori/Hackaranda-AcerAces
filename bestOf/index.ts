import { BotProcess, type identifier } from "../botHandler/index.js";
import type { gameTitle } from "../games/index.js";
import gameTypes from "../games/index.js";
import { playMatch } from "../match/index.js";

export type bestOfResults = Record<identifier | "Draws", number>;
export async function playBestOf(
  botA: BotProcess,
  botB: BotProcess,
  id: number,
  gameTitle: gameTitle,
  bestOf: number,
  alternatePlayer1 = true,
  log = false,
): Promise<bestOfResults> {
  log && console.log("Beginning bestOf", bestOf, "id", id);
  let gameType = gameTypes[gameTitle];

  let results = { [botA.identifier]: 0, [botB.identifier]: 0, draws: 0 };
  try {
    for (let i = 0; i < bestOf; i++) {
      if (i % 2 && alternatePlayer1) {
        [botA, botB] = [botB, botA];
      }
      const newGameMessage = gameType.newGameMessage(i);
      await botA.send(newGameMessage);
      await botB.send(newGameMessage);

      const winner = await playMatch(botA, botB, i, gameTitle, log);
      if (winner === 2) {
        // (wins[botA.identifier] as number) += 0.5;
        // (wins[botB.identifier] as number) += 0.5;
        results.draws++;
      } else if (winner === 0) {
        (results[botA.identifier] as number) += 1;
      } else if (winner === 1) {
        (results[botB.identifier] as number) += 1;
      }
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
    return results;
  }
}
