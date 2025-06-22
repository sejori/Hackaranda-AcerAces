import { discardMove } from "./discard.js";
import { randomPlayMove } from "./play.js";
import type { move, playerState } from "./types.js";

export function handleMove(state: playerState<move>) {
  switch (state.subTurn) {
    case 0:
    case 1:
      return randomDrawMove(state);
    case 2:
      return randomPlayMove(state);
    case 3:
      return discardMove(state);
  }
}

function randomDrawMove(state: playerState<move>) {
  const options: (0 | 1 | 2)[] = [];
  if (state.deck > 0) {
    options.push(0);
  }
  if (state.discard.length > 0) {
    options.push(1);
  }
  if (state.opponentDiscard.length > 0) {
    options.push(2);
  }

  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}
