import { confirm } from "@inquirer/prompts";
import { setTimeout } from "timers/promises";

export async function continueMethodHandler(continueMethod: "enter" | number) {
  if (continueMethod === "enter") {
    await confirm({ message: "Continue to next round?" });
  } else {
    await setTimeout(continueMethod);
  }
}
