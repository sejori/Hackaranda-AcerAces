import filenamify from "filenamify";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { identifier } from "../turnHandlers/botHandler/index.js";
import type { record } from "./roundRobin/index.js";
import type { bestOfResults } from "../bestOf/index.js";
import type { gameTitle } from "../games/index.js";

export type tournamentOutState = {
  results: { identifier: identifier; record: record; rank: number }[];
  rounds: [identifier, identifier][][];
  matchups: Record<identifier, bestOfResults>[];
};
export async function saveOut(
  tournamentName: string,
  gameTitle: gameTitle,
  out: tournamentOutState,
) {
  const tournamentResultsGameDir = path.join(
    import.meta.dirname,
    "../../tournamentResults",
    gameTitle,
  );
  const tournamentNameDir = path.join(
    tournamentResultsGameDir,
    filenamify(tournamentName),
  );
  await mkdir(tournamentNameDir);

  const tournamentResults = {
    results: out.results,
    rounds: out.rounds,
  };
  const tournamentResultsJSON = path.join(tournamentNameDir, "results.json");
  await writeFile(tournamentResultsJSON, JSON.stringify(tournamentResults));

  const pad = (roundNumber: number) => {
    return String(roundNumber).padStart(String(out.rounds.length).length, "0");
  };
  for (let i = 0; i < out.rounds.length; i++) {
    if (out.rounds[i]?.length === 0) {
      break;
    }
    const roundDir = path.join(tournamentNameDir, `Round${pad(i)}`);
    await mkdir(roundDir);
    const matchups = out.matchups[i];
    if (matchups === undefined) {
      break;
    }
    for (let matchup of out.rounds[i] ?? []) {
      const matchupDir = path.join(roundDir, `${matchup[0]}-${matchup[1]}`);
      await mkdir(matchupDir);
      const games = out.matchups[i]?.[matchup[0]];
      if (games === undefined) {
        break;
      }

      const matchupResultsPath = path.join(matchupDir, "results.json");
      const gameResults = [];
      for (let game of games.bestOfHistory) {
        gameResults.push({
          winner: game.winner,
          players: game.players,
        });
      }
      const results = {
        gameResults,
        ...games.results,
      };
      await writeFile(matchupResultsPath, JSON.stringify(results));

      const gamesDir = path.join(matchupDir, "games");
      await mkdir(gamesDir);
      const pad = (roundNumber: number) => {
        return String(roundNumber).padStart(
          String(games.bestOfHistory.length).length,
          "0",
        );
      };

      for (
        let gameNumber = 0;
        gameNumber < games.bestOfHistory.length;
        gameNumber++
      ) {
        const gamePath = path.join(gamesDir, `${pad(gameNumber)}.json`);
        const game = games.bestOfHistory[gameNumber];
        await writeFile(gamePath, JSON.stringify(game));
      }
    }
  }
}
