import { confirm, input } from "@inquirer/prompts";
import type { gameTitle } from "../../games/index.js";
import gameTypes from "../../games/index.js";
import { setTimeout } from "node:timers/promises";

export type identifier = string;

export class PlayBackProcess {
  constructor(
    public imageName: string,
    public identifier: string,
    private gameTitle: gameTitle,
    public round: string = "",
    public gameNumber: number = 0,
    private moves: any[],
    private primary = false,
    private continueMethod: "enter" | number = "enter",
    private moveCount = 0,
  ) {}

  async send(gameState: any) {
    const game = gameTypes[this.gameTitle];
    if (gameState.message === "NEWGAME") {
      this.round = gameState.round;
      this.gameNumber = gameState.gameNumber;
      return;
    }
    if (gameState.message === "ENDGAME") return;
    if (
      this.primary &&
      gameState.showPreviousTurn &&
      gameState.previousTurn.move !== false
    ) {
      await game.showPreviousTurn(
        gameState,
        this.identifier,
        this.gameNumber,
        this.round,
        this.continueMethod,
      );
      console.log("showedPrevious Turn");
    }
    if (!gameState.activeTurn) {
      return;
    }
    if (
      game.displayForUser === undefined ||
      game.playerMoveValidator === undefined ||
      game.userMoveTranslate === undefined ||
      game.userMoveMessage === undefined
    ) {
      return;
    }
    if (this.primary) {
      game.displayForUser(
        gameState,
        this.identifier,
        this.gameNumber,
        this.round,
      );
      console.log("showed current Turn");
    }
    try {
      let move = this.moves[this.moveCount++];
      if (!this.primary) {
        return move;
      }
      if (this.continueMethod === "enter") {
        await confirm({ message: "Continue?" });
      } else {
        await setTimeout(this.continueMethod);
      }
      return move;
    } catch (e) {
      console.log(e);
      console.log("Game quit!");
      process.exit();
    }
  }

  kill() {}
}
process.on("uncaughtException", (error) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
  } else {
    // Rethrow unknown errors
    throw error;
  }
});
