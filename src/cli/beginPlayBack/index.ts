import { type gameTitle } from "../../games/index.js";
import fileSelector from "inquirer-file-selector";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { validateMatchData } from "../../helpers/validateMatchData.js";
import { playMatch } from "../../match/index.js";
import { PlayBackProcess } from "../../turnHandlers/playBackHandler/index.js";
import {
  BotProcess,
  type identifier,
} from "../../turnHandlers/botHandler/index.js";
import type { gameState } from "../../games/types.js";
import { number, select } from "@inquirer/prompts";

export async function beginPlayBack() {
  let matchDir = "";
  let validFile = false;
  while (!validFile) {
    try {
      matchDir = await fileSelector({
        message: "Select a file:",
        type: "file",
        filter: (item) => item.path.includes(".json") || item.isDirectory(),
        loop: true,
        basePath: path.join(import.meta.dirname, "../../../matchResults"),
      });
      validFile = await validateMatch(matchDir);
    } catch (e) {
      break;
    }
  }

  let continueMethod: "enter" | "timed" | number = await select({
    message: "Select continue type:",
    choices: [
      {
        value: "enter",
        name: "Progress on ENTER",
      },
      {
        value: "timed",
        name: "After a time",
      },
    ],
  });
  if (continueMethod === "timed") {
    continueMethod = await number({
      message: "Choose move time:",
      min: 1,
      required: true,
      default: 1000,
    });
  }
  let contents = await readFile(matchDir);
  let matchData = JSON.parse(contents.toString());
  const game = matchData.game as gameTitle;
  const initialState = matchData.initialState as gameState;
  const moves = matchData.moves as any[];
  const players = matchData.players as [identifier, identifier];

  const playBackPlayer1 = new PlayBackProcess(
    "player",
    players[0],
    game,
    "playback",
    1,
    moves.filter((_a, i) => Math.floor(i / 4) % 2 == 0),
    false,
    continueMethod,
  ) as unknown as BotProcess;
  const playBackPlayer2 = new PlayBackProcess(
    "player",
    players[1],
    game,
    "playback",
    1,
    moves.filter((_a, i) => Math.floor(i / 4) % 2 == 1),
    true,
    continueMethod,
  ) as unknown as BotProcess;
  await playMatch(
    playBackPlayer1,
    playBackPlayer2,
    0,
    game,
    false,
    initialState,
    true,
  );

  console.log("exiting");
  process.exit();
}

function mapIntoChoices(l: any[]) {
  return l.map((a) => {
    return { value: a, name: a };
  });
}

const validateMatch = validateDataFile(validateMatchData);

function validateDataFile(validator: (matchData: any) => boolean) {
  return async (fileDir: string) => {
    try {
      let contents = await readFile(fileDir);
      let unvalidatedMatchData = JSON.parse(contents.toString());
      let result = validator(unvalidatedMatchData);
      if (!result) {
        console.log("Invalid file");
        return false;
      }
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };
}
