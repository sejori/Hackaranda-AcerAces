import { input } from "@inquirer/prompts";
import type { gameTitle } from "../games/index.js";
import gameTypes from "../games/index.js";

export type identifier = string;

export class PlayerProcess {
  constructor(
    public imageName: string,
    public identifier: string,
    private gameTitle: gameTitle,
  ) {}

  async send(gameState: any) {
    const game = gameTypes[this.gameTitle];
    if (gameState.message === "NewGame" || !gameState.activeTurn) return;
    if (
      game.displayForUser === undefined ||
      game.playerMoveValidator === undefined ||
      game.userMoveTranslate === undefined ||
      game.userMoveMessage === undefined
    )
      return;
    game.displayForUser(gameState, this.identifier);
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
