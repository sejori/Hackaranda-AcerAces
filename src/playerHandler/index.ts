import { input } from "@inquirer/prompts";
import type { gameTitle } from "../games/index.js";
import gameTypes from "../games/index.js";

export type identifier = string;

export class PlayerProcess {
  constructor(
    public imageName: string,
    public identifier: string,
    private gameTitle: gameTitle,
    public round: string = "",
    public gameNumber: number = 0,
  ) {}

  async send(gameState: any) {
    const game = gameTypes[this.gameTitle];
    if (gameState.message === "NEWGAME") {
      console.log("NewGame, updating state", gameState);
      this.round = gameState.round;
      this.gameNumber = gameState.gameNumber;
      return;
    }
    if (gameState.message === "ENDGAME") return;
    if (gameState.showPreviousTurn && gameState.previousTurn.move !== false) {
      await game.showPreviousTurn(gameState, this.gameNumber, this.round);
    }
    if (!gameState.activeTurn) {
      return;
    }
    if (
      game.displayForUser === undefined ||
      game.playerMoveValidator === undefined ||
      game.userMoveTranslate === undefined ||
      game.userMoveMessage === undefined
    )
      return;
    game.displayForUser(
      gameState,
      this.identifier,
      this.gameNumber,
      this.round,
    );
    try {
      let move = await input({
        message: game.userMoveMessage(gameState),
        validate: game.playerMoveValidator(gameState),
      });
      return game.userMoveTranslate(move, gameState);
    } catch (e) {
      console.log("Game quit!");
      process.exit();
    }
  }

  kill() {}
}
