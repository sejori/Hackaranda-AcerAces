import { arboretum } from "./arboretum/index.js";
import { tictactoe } from "./tictactoe/index.js";
import type { gameInterface } from "./types.js";

const gameTypes: Record<gameTitle, gameInterface<any, any, any, any, any>> = {
  tictactoe: tictactoe,
  arboretum: arboretum,
  suits: tictactoe,
};

export type gameTitle = "arboretum" | "tictactoe" | "suits";
export default gameTypes;
