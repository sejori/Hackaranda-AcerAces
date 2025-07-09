import { input, number, select } from "@inquirer/prompts";
import gameTypes from "../../games/index.js";
import fileSelector from "inquirer-file-selector";
import { readFile } from "node:fs/promises";
import {
  PLAYERS,
  TOURNAMENT_TYPE,
  USERPLAYER,
} from "../../tournaments/types.js";
import type { tournamentSettings } from "../../tournaments/types.js";
import { validatePlayerList } from "../../helpers/validatePlayerList.js";
import { createTournament } from "../../tournaments/index.js";
import { select as multiSelect } from "inquirer-select-pro";
import { getPlayerDetails } from "../../helpers/getPlayerDetails.js";
import path from "node:path";
import { dockerActiveChoice } from "../helpers/docker.js";

export async function beginBestOf() {
  const choice = await dockerActiveChoice();
  if (!choice) {
    return;
  }
  const gameType = await select({
    message: "Choose type of game",
    choices: typeOfGameOptions,
    default: "tictactoe",
  });

  const bestOfName = await input({
    message: "Enter a unique tournament name:",
    required: true,
    default: gameType + "-" + new Date().toJSON().split(".")[0],
  });

  const bestOf = await number({
    message: "Choose best of",
    min: 1,
    required: true,
    default: 1,
  });

  let players;
  let playersDir = "";
  let playerDetails = [];
  while (players !== PLAYERS.random) {
    players = await select({
      message: "Which players?",
      choices: playersOptions,
      default: PLAYERS.random,
    });
    if (players === PLAYERS.fromFile) {
      let validFile = false;
      while (!validFile) {
        try {
          playersDir = await fileSelector({
            message: "Select a file:",
            type: "file",
            filter: (item) => item.path.includes(".json") || item.isDirectory(),
            loop: true,
            basePath: path.join(import.meta.dirname, "../../../bots", gameType),
          });
          validFile = await validatePlayerFile(playersDir);
        } catch (e) {
          break;
        }
      }
      if (validFile) {
        playerDetails = await getPlayerDetails(playersDir);
        break;
      }
    }
  }
  let selectedDetails = [];
  if (players === PLAYERS.fromFile) {
    const defaultValue = playerDetails.map(
      (player: { value: string }) => player.value,
    );
    selectedDetails = await multiSelect({
      message: "Select players:",
      options: playerDetails,
      canToggleAll: true,
      required: true,
      defaultValue,
    });
  }
  if (selectedDetails.length > 1) {
    selectedDetails = [selectedDetails[0], selectedDetails[1]];
  } else if (selectedDetails.length > 0) {
    selectedDetails = [selectedDetails[0]];
  }

  const messageTimeout = await number({
    message: "Message timeout (ms):",
    min: 1,
    default: 300,
    required: true,
  });

  const userPlayer = await select({
    message: "User plays?:",
    choices: userPlayerOptions,
    default: USERPLAYER["don't play"],
  });
  let userName = "";
  if (userPlayer === USERPLAYER.play) {
    userName = await input({
      message: "User name:",
      required: true,
    });
  }

  const tournamentSettings: tournamentSettings = {
    numberOfPlayers: 2,
    gameType,
    tournamentType: TOURNAMENT_TYPE.roundRobin,
    bestOf,
    players,
    playersDir,
    playerDetails: selectedDetails,
    messageTimeout,
    tournamentName: bestOfName,
    userPlayer,
    userName,
    seeding: "random",
    seedingDir: "",
    continueMethod: 0,
  };
  await createTournament(tournamentSettings);
  process.exit();
}

function mapIntoChoices(l: any[]) {
  return l.map((a) => {
    return { value: a, name: a };
  });
}

const games = Object.keys(gameTypes);
const typeOfGameOptions = mapIntoChoices(games);

const players = Object.keys(PLAYERS);
const playersOptions = mapIntoChoices(players);

const userPlayer = Object.keys(USERPLAYER);
const userPlayerOptions = mapIntoChoices(userPlayer);

const validatePlayerFile = validateFile(validatePlayerList);

function validateFile(validator: (list: any[]) => boolean) {
  return async (fileDir: string, numberOfPlayers?: number) => {
    try {
      let contents = await readFile(fileDir);
      let unvalidatedList = JSON.parse(contents.toString());
      if (numberOfPlayers && numberOfPlayers > unvalidatedList.length) {
        return false;
      }
      let result = validator(unvalidatedList);
      if (!result) {
        console.log("Invalid file");
        return false;
      }
      return unvalidatedList.length;
    } catch (e) {
      console.log(e);
      return false;
    }
  };
}
