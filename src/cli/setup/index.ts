import { readFile } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import chalk from "chalk";
import { allGameTitles, type gameTitle } from "../../games/index.js";
import type { botDetail } from "../../tournaments/types.js";
import { dockerActiveChoice } from "../helpers/docker.js";

export async function setup() {
  // Docker bots
  const dockerBotsURL = path.join(
    import.meta.dirname + "../../../../src/defaultBots",
  );
  const defaultBotsURL = path.join(import.meta.dirname + "../../../../bots");
  const choice = await dockerActiveChoice();
  if (!choice) {
    return;
  }

  const failures: Record<gameTitle, botDetail[]> = {
    arboretum: [],
    tictactoe: [],
  };
  for (let game of allGameTitles) {
    const failed = await buildBots(dockerBotsURL, defaultBotsURL, game);
    failures[game] = failed;
    console.log("");
  }
  for (let game of allGameTitles) {
    if (failures[game].length === 0) {
      continue;
    }
    console.log(
      "\nThe following",
      game,
      "bot could not be built. Please try to build manually.",
    );
    for (let bot of failures[game]) {
      console.log("--", bot.identifier);
    }
  }
}

async function buildBots(
  dockerBotsURL: string,
  defaultBotsURL: string,
  game: string,
) {
  console.log("Building", game, "bots");
  const gameURL = path.join(defaultBotsURL, game, "defaultBots.json");
  const f = await readFile(gameURL);
  const bots = JSON.parse(f.toString());
  const failedBuilds = [];
  for (let bot of bots) {
    try {
      console.log("-", bot.identifier);
      const { dockerId, path: filePath } = bot;
      if (path === undefined) {
        console.log(chalk.green("-- No path"));
        continue;
      }
      const target = path.join(dockerBotsURL, game, filePath);
      const success = await build(dockerId, target);
      if (success == 0) {
        console.log(chalk.green("-- Success"));
      } else {
        failedBuilds.push(bot);
        console.log(chalk.red("-- Error"));
      }
    } catch (e) {
      failedBuilds.push(bot);
      console.log(e);
      console.log(chalk.red("-- Error"));
    }
  }
  return failedBuilds;
}

function build(identifier: string, target: string) {
  return new Promise((res) => {
    const docker = spawn("docker", ["build", "-t", identifier, target]);

    docker.on("close", (code: any) => {
      res(code);
    });
  });
}
