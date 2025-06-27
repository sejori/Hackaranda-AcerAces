import { select } from "@inquirer/prompts";
import { beginTournament } from "./beginTournament/index.js";
import { beginBestOf } from "./beginBestOf/index.js";
import { setup } from "./setup/index.js";

async function go() {
  console.clear();
  welcomeMessage();
  const toplevelChoice = await select({
    message: "Choose an option",
    choices: toplevelOptions,
  });
  await toplevelChoice();
}

type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  short?: string;
  disabled?: boolean | string;
  type?: never;
};

const toplevelOptions: Choice<() => Promise<void>>[] = [
  {
    value: beginBestOf,
    name: "Begin Best Of",
  },
  {
    value: beginTournament,
    name: "Begin Tournament",
  },
  {
    value: setup,
    name: "Build Default Bots",
  },
];

function welcomeMessage() {
  console.log("Welcome");
}

go();

process.on("uncaughtException", (error) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
  } else {
    // Rethrow unknown errors
    throw error;
  }
});
