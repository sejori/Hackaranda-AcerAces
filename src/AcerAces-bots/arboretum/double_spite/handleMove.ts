import { discard } from "./discard.js";
import { randomDrawMove } from "./draw.js";
import { play } from "./play.js";
import type { move, playerState, playMove } from "./types.js";

export function handleMove(state: playerState<move>) {
  switch (state.subTurn) {
    case 0:
    case 1:
      return randomDrawMove(state);
    case 2:
      return play(state as playerState<playMove>);
    case 3:
      return discard(state as any);
  }
}
