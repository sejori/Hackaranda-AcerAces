import { confirm } from "@inquirer/prompts";
import { BotProcess, type identifier } from "../botHandler/index.js";
import type { gameTitle } from "../games/index.js";
import gameTypes from "../games/index.js";
import type { winner } from "../games/types.js";
import { writeFileSync } from "node:fs";

export async function playMatch(
  botA: BotProcess,
  botB: BotProcess,
  id: number,
  gameTitle: gameTitle,
  log = false,
) {
  let gameType = gameTypes[gameTitle];
  let gameState = gameType.getInitialGameState();
  log && console.log("Initial state:", gameState);
  let winner: winner<any> = { result: 2, metaData: {}, scoreA: 0, scoreB: 0 };
  let timeouts: Record<identifier, number> = {};
  let scoreA = 0;
  let scoreB = 0;
  let output: any[] = [JSON.parse(JSON.stringify(gameState))];

  try {
    while (!gameType.gameOver(gameState)) {
      const [currentPlayer, nextPlayer] =
        gameState.currentPlayer === 0 ? [botA, botB] : [botB, botA];

      const currentGameState = gameType.getActivePlayerState(gameState);
      currentGameState.opponent = nextPlayer.identifier;

      const otherGameState = gameType.getInactivePlayerState(gameState);
      otherGameState.opponent = currentPlayer.identifier;

      const otherMove = nextPlayer.send(otherGameState);
      let move = await currentPlayer.send(currentGameState);
      await otherMove;

      if (move === "RANDOM") {
        move = gameType.getRandomMove(currentGameState);
      }
      if (move === "sendTimeout") {
        move = gameType.getRandomMove(currentGameState);
        let timeout = timeouts[currentPlayer.identifier];
        if (timeout === undefined) {
          timeouts[currentPlayer.identifier] = 0;
        }
        (timeouts[currentPlayer.identifier] as number)++;
      }
      if (!gameType.isValidMove(gameState, move)) {
        console.log("Invalid move", move);
        move = gameType.getRandomMove(currentGameState);
      }

      log &&
        console.log(
          `Game ${id}: Player ${gameState.currentPlayer} played:`,
          move,
        );
      output.push(move);
      gameState = gameType.applyMove(gameState, move);
      log && console.log(`Game ${id}:`, "game state is now:", gameState);
    }

    winner = gameType.getWinner(gameState);
    // console.log(winner);
    if (botA.imageName === "player" || botB.imageName === "player") {
      gameType.showScore(gameState, winner, botA.identifier, botB.identifier);
      await confirm({ message: "Enter to continue." });
    }
    scoreA += winner.scoreA;
    scoreB += winner.scoreB;
  } catch (error) {
    console.error(error);
    log && console.error(error);
  } finally {
    // const fileName = crypto.randomUUID();
    // writeFileSync("./matchData/" + fileName + ".json", JSON.stringify(output));
    // if (winner.result === 2) {
    //   console.log(2);
    //   console.log({ scoreA, scoreB });
    // }
    // if (winner.result === 1) {
    //   console.log(1);
    //   console.log({ scoreA, scoreB });
    // }
    // if (winner.result === 0) {
    //   console.log(0);
    //   console.log({ scoreA, scoreB });
    // }
    return {
      result: winner.result,
      scores: [scoreA, scoreB],
      timeouts,
      gameState,
    };
  }
}
