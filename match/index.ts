import { confirm } from "@inquirer/prompts";
import { BotProcess } from "../botHandler/index.js";
import type { gameTitle } from "../games/index.js";
import gameTypes from "../games/index.js";
import type { winner } from "../games/types.js";

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
  let winner: winner<any> = { result: 2, metaData: {} };

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

      if (move === "sendTimeout") {
        move = gameType.getRandomMove(currentGameState);
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
      gameState = gameType.applyMove(gameState, move);
      log && console.log(`Game ${id}:`, "game state is now:", gameState);
    }

    winner = gameType.getWinner(gameState);
    if (botA.imageName === "player" || botB.imageName === "player") {
      gameType.showScore(gameState, winner, botA.identifier, botB.identifier);
      await confirm({ message: "Enter to continue." });
    }
  } catch (error) {
    log && console.error(error);
  } finally {
    return winner.result;
  }
}
