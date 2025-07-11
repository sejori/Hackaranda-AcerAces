import { confirm } from "@inquirer/prompts";
import {
  BotProcess,
  type identifier,
} from "../turnHandlers/botHandler/index.js";
import type { gameTitle } from "../games/index.js";
import { default as defaultTypes } from "../games/index.js";
import type { winner } from "../games/types.js";
import path from "path";
import { writeFile } from "fs/promises";

export type matchHistory = {
  game: gameTitle;
  players: [identifier, identifier];
  initialState: any;
  moves: any[];
  winner: winner<any>;
};

export async function playMatch(
  botA: BotProcess,
  botB: BotProcess,
  id: number,
  gameTitle: gameTitle,
  log = false,
  initialState: boolean | any = false,
  playBack = false,
  gameTypes = defaultTypes,
) {
  let gameType = gameTypes[gameTitle];
  let gameState = gameType.getInitialGameState(initialState, playBack);
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

      const currentGameState = gameType.getActivePlayerState(
        process.env.DEBUG
          ? {
              ...gameState,
              playBack:
                currentPlayer.imageName === "player"
                  ? true
                  : gameState.playBack,
            }
          : gameState,
      );
      currentGameState.opponent = nextPlayer.identifier;

      const otherGameState = gameType.getInactivePlayerState(
        process.env.DEBUG
          ? {
              ...gameState,
              playBack:
                currentPlayer.imageName === "player"
                  ? true
                  : gameState.playBack,
            }
          : gameState,
      );
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
    const out = {
      game: gameTitle,
      players: [botA.identifier, botB.identifier],
      initialState: output[0],
      moves: output.slice(1),
      winner,
    } as matchHistory;
    return {
      result: winner.result,
      scores: [scoreA, scoreB],
      timeouts,
      gameState,
      matchHistory: out,
    };
  }
}

async function writeOutputToFile(
  output: any[],
  players: [identifier, identifier],
  game: gameTitle,
  winner: any,
) {
  const out = {
    game,
    players,
    initialState: output[0],
    moves: output.slice(1),
    winner,
  };
  const jsonRows = JSON.stringify(out);
  const tournamentResultsFile = path.join(
    import.meta.dirname,
    "../../matchResults",
    game,
    crypto.randomUUID() + ".json",
  );
  await writeFile(tournamentResultsFile, jsonRows);
}
