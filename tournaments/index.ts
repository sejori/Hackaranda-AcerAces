import { readFile } from "node:fs/promises";
import { roundRobin, type botDetail } from "./roundRobin/index.js";
import { PLAYERS, USERPLAYER, type tournamentSettings } from "./types.js";
import gameTypes from "../games/index.js";

export async function createTournament(tournamentSettings: tournamentSettings) {
  let botDetails: botDetail[] = tournamentSettings.playerDetails;
  const game = gameTypes[tournamentSettings.gameType];
  const startLength = botDetails.length;
  for (let i = 0; i < tournamentSettings.numberOfPlayers - startLength; i++) {
    botDetails.push(game.defaultBotDetail(i));
  }

  let tableLog = true;

  if (tournamentSettings.userPlayer === USERPLAYER.play) {
    tableLog = false;
    botDetails.push({
      dockerId: "player",
      identifier: tournamentSettings.userName,
    });
  }
  const bestof = tournamentSettings.bestOf;
  const messageTimeout = tournamentSettings.messageTimeout;

  const time = Date.now();
  await roundRobin(
    botDetails,
    tournamentSettings.gameType,
    bestof,
    messageTimeout,
    true,
    false,
    tableLog,
  );
  console.log((Date.now() - time) / 1000, "seconds");
}

async function createBotDetailsFromFile(fileDir: string): Promise<botDetail[]> {
  try {
    let contents = await readFile(fileDir);
    return JSON.parse(contents.toString());
  } catch (e) {
    console.error(e);
  }
  return [];
}
