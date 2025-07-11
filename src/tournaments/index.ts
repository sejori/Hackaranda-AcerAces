import { readFile } from "node:fs/promises";
import { roundRobin } from "./roundRobin/index.js";
import {
  SEEDING,
  USERPLAYER,
  type botDetail,
  type tournamentSettings,
} from "./types.js";
import { type gameTitle } from "../games/index.js";
import gameTypes from "../games/index.js";
import {
  BotProcess,
  type identifier,
} from "../turnHandlers/botHandler/index.js";
import { PlayerProcess } from "../turnHandlers/playerHandler/index.js";
import { knockout } from "./knockout/index.js";

export async function createTournament(tournamentSettings: tournamentSettings) {
  switch (tournamentSettings.tournamentType) {
    case "roundRobin":
      await createRoundRobinTournament(tournamentSettings);
      break;
    case "knockout":
      await createKnockoutTournament(tournamentSettings);
      break;
  }
}

export async function createRoundRobinTournament(
  tournamentSettings: tournamentSettings,
) {
  let botDetails: botDetail[] = tournamentSettings.playerDetails;
  const game = gameTypes[tournamentSettings.gameType];
  let tableLog = true;
  if (tournamentSettings.userPlayer === USERPLAYER.play) {
    tableLog = false;
    botDetails.push({
      dockerId: "player",
      identifier: tournamentSettings.userName,
    });
  }
  const startLength = botDetails.length;
  for (let i = 0; i < tournamentSettings.numberOfPlayers - startLength; i++) {
    botDetails.push(game.defaultBotDetail(i));
  }

  const bestof = tournamentSettings.bestOf;
  const messageTimeout = tournamentSettings.messageTimeout;

  const time = Date.now();
  await roundRobin(
    botDetails,
    tournamentSettings.gameType,
    tournamentSettings.tournamentName,
    bestof,
    tournamentSettings.continueMethod,
    tournamentSettings.save,
    messageTimeout,
    true,
    false,
    tableLog,
  );
  console.log((Date.now() - time) / 1000, "seconds");
}

function getNextPowerOfTwo(n: number) {
  let nextPowerOfTwo = 1;
  while (nextPowerOfTwo < n) {
    nextPowerOfTwo *= 2;
  }
  return nextPowerOfTwo;
}

export async function createKnockoutTournament(
  tournamentSettings: tournamentSettings,
) {
  let seeding: Record<string, number> = {};
  if (tournamentSettings.seeding === SEEDING.fromFile) {
    let contents = await readFile(tournamentSettings.seedingDir);
    let seedingFile = JSON.parse(contents.toString());
    for (let player of seedingFile) {
      seeding[player.identifier] = player.rank;
    }
  }
  let botDetails: botDetail[] = tournamentSettings.playerDetails;
  botDetails.sort((a, b) => {
    const aRank = seeding[a.identifier];
    const bRank = seeding[b.identifier];
    if (bRank === undefined) {
      return -1;
    }
    if (aRank === undefined) {
      return 1;
    }
    return aRank - bRank;
  });
  const game = gameTypes[tournamentSettings.gameType];
  let tableLog = true;
  if (tournamentSettings.userPlayer === USERPLAYER.play) {
    tableLog = false;
    botDetails.unshift({
      dockerId: "player",
      identifier: tournamentSettings.userName,
    });
  }
  const numberOfPlayers = Math.max(
    tournamentSettings.numberOfPlayers,
    botDetails.length,
  );
  const startLength = botDetails.length;
  const nextPowerOfTwo = getNextPowerOfTwo(numberOfPlayers);
  for (let i = 0; i < nextPowerOfTwo - startLength; i++) {
    botDetails.push(game.defaultBotDetail(i));
  }

  const bestof = tournamentSettings.bestOf;
  const messageTimeout = tournamentSettings.messageTimeout;

  const time = Date.now();
  await knockout(
    botDetails,
    tournamentSettings.gameType,
    tournamentSettings.tournamentName,
    botDetails.map((detail) => detail.identifier),
    bestof,
    tournamentSettings.continueMethod,
    tournamentSettings.save,
    messageTimeout,
    true,
    false,
    tableLog,
  );
  console.log((Date.now() - time) / 1000, "seconds");
}

export function botsFromBotDetail(
  botDetails: botDetail[],
  gameTitle: gameTitle,
  moveTimeout: number,
): [Record<string, BotProcess>, identifier[]] {
  let bots: Record<string, BotProcess> = {};
  let identifiers = [];
  for (let botDetail of botDetails) {
    identifiers.push(botDetail.identifier);
    if (botDetail.dockerId === "player") {
      bots[botDetail.identifier] = new PlayerProcess(
        botDetail.dockerId,
        botDetail.identifier,
        gameTitle,
      ) as unknown as BotProcess;
      continue;
    }
    bots[botDetail.identifier] = new BotProcess(
      botDetail.dockerId,
      botDetail.identifier,
      moveTimeout,
      botDetail.variables,
    );
  }
  return [bots, identifiers];
}
