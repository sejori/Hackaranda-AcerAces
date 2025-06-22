import type { move, playerState, species } from "./types.js";

function randomDrawMove(state: playerState<move>) {
  const options = [];
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
export function drawMove(state: playerState<move>) {
  return randomDrawMove(state);
}
