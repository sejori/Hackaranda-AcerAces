import { type UUID } from "node:crypto";
import { handleMove } from "./handleMove.js";
import readline from "node:readline";
import type { move, playerState } from "./types.js";

// Handles reading lines
export function beginReadline() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", (line) => {
    try {
      const { state, messageID } = JSON.parse(line) as {
        state: playerState<move>;
        messageID: UUID;
      };
      if (
        (state as any).message === "NEWGAME" ||
        (state as any).message === "ENDGAME"
      ) {
        sendNEWGAME((state as any).gameNumber, messageID);
        return;
      }

      if (!state.activeTurn) {
        sendMove(0, messageID);
        return;
      }

      const move = handleMove(state);
      sendMove(move, messageID);
    } catch (err) {
      console.error(err);
    }
  });

  function sendMove<T>(move: T, messageID: UUID) {
    const message = JSON.stringify({ move, messageID });
    process.stdout.write(message + "\n");
  }

  function sendNEWGAME(gameNumber: number, messageID: UUID) {
    const response = { result: "accepted", gameNumber };
    sendMove(response, messageID);
  }
}
