import { input, number, select } from "@inquirer/prompts";
import gameTypes from "../../games/index.js";
import fileSelector from "inquirer-file-selector";
import { readFile } from "node:fs/promises";
import {
  CREDENTIALS,
  DISPLAY_TYPE,
  PLAYERS,
  SEEDING,
  TOURNAMENT_TYPE,
  USERPLAYER,
} from "../../tournaments/types.js";
import type { tournamentSettings } from "../../tournaments/types.js";
import { validateAPIKeyList } from "../../helpers/validateAPIKeyList.js";
import { validateSeedingList } from "../../helpers/validateSeedingList.js";
import { validatePlayerList } from "../../helpers/validatePlayerList.js";
import { createTournament } from "../../tournaments/index.js";
import { select as multiSelect } from "inquirer-select-pro";
import { getPlayerDetails } from "../../helpers/getPlayerDetails.js";
import path from "node:path";

export async function beginTournament() {
  const gameType = await select({
    message: "Choose type of game",
    choices: typeOfGameOptions,
    default: "tictactoe",
  });

  const tournamentType = await select({
    message: "Choose type of tournament",
    choices: typeOfTournamentOptions,
    default: TOURNAMENT_TYPE.roundRobin,
  });

  const tournamentName = await input({
    message: "Enter a unique tournament name:",
    required: true,
    default:
      gameType + "-" + tournamentType + "-" + new Date().toJSON().split(".")[0],
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
          const basePath = path.join(
            import.meta.dirname,
            "../../../bots",
            gameType,
          );
          console.log(basePath);
          playersDir = await fileSelector({
            message: "Select a file:",
            type: "file",
            filter: (item) => item.path.includes(".json") || item.isDirectory(),
            loop: true,
            basePath,
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

  const numberOfPlayers = await number({
    message: "Number of players",
    min: 2,
    required: true,
    default: Math.max(selectedDetails.length || 2, 2),
  });
  const bestOf = await number({
    message: "Choose best of",
    min: 1,
    required: true,
    default: 1,
  });
  let seeding;
  let seedingDir = "";
  while (seeding !== SEEDING.random) {
    seeding = await select({
      message: "Choose seeding",
      choices: seedingOptions,
      default: SEEDING.random,
    });
    if (seeding === SEEDING.fromFile) {
      let validFile = false;
      while (!validFile) {
        try {
          seedingDir = await fileSelector({
            message: "Select a file:",
            type: "file",
            filter: (item) => item.path.includes(".json") || item.isDirectory(),
            loop: true,
            basePath: path.join(
              import.meta.dirname,
              "../../../tournamentResults",
              gameType,
            ),
          });
          validFile = await validateSeedingFile(seedingDir);
        } catch (e) {
          break;
        }
      }
      if (validFile) {
        break;
      }
    }
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
    numberOfPlayers,
    gameType,
    tournamentType,
    bestOf,
    players,
    playersDir,
    playerDetails: selectedDetails,
    messageTimeout,
    tournamentName,
    userPlayer,
    userName,
    seeding,
    seedingDir,
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

const tournaments = Object.keys(TOURNAMENT_TYPE);
const typeOfTournamentOptions = mapIntoChoices(tournaments);

const displayTypes = Object.keys(DISPLAY_TYPE);
const displayTypeOptions = mapIntoChoices(displayTypes);

const credentials = Object.keys(CREDENTIALS);
const credentialsOptions = mapIntoChoices(credentials);

const seeding = Object.keys(SEEDING);
const seedingOptions = mapIntoChoices(seeding);

const players = Object.keys(PLAYERS);
const playersOptions = mapIntoChoices(players);

const userPlayer = Object.keys(USERPLAYER);
const userPlayerOptions = mapIntoChoices(userPlayer);

const validateCredentialFile = validateFile(validateAPIKeyList);
const validateSeedingFile = validateFile(validateSeedingList);
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

const tournamentID = ["GenerateRandomID", "SelectID"];
type tournamentIDOptions = "GenerateRandomID" | "SelectID";
const tournamentIDOptions = mapIntoChoices(tournamentID);

async function chooseTournamentID(tournamentIDChoice: tournamentIDOptions) {
  if (tournamentIDChoice === "GenerateRandomID") {
    return crypto.randomUUID().slice(0, 8);
  }
  if (tournamentIDChoice === "SelectID") {
    return await input({ message: "Enter tournament ID:", required: true });
  }
  return "";
}
