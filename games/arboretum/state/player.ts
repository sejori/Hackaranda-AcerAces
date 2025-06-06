import type { gameState, playerState } from "../types.js";

export function getActivePlayerState(state: gameState): playerState {
  return {
    deck: state.deck.length,
    hand: state.currentPlayer == 0 ? state.handA : state.handB,
    discard: state.currentPlayer == 0 ? state.discardA : state.discardB,
    opponentDiscard: state.currentPlayer == 0 ? state.discardB : state.discardA,
    playArea: state.currentPlayer == 0 ? state.playAreaA : state.playAreaB,
    opponentPlayArea:
      state.currentPlayer == 0 ? state.playAreaB : state.playAreaA,
    turn: state.turn,
    subTurn: state.subTurn,
    activeTurn: true,
  };
}

export function getInactivePlayerState(state: gameState): playerState {
  return {
    deck: state.deck.length,
    hand: state.currentPlayer == 1 ? state.handA : state.handB,
    discard: state.currentPlayer == 1 ? state.discardA : state.discardB,
    opponentDiscard: state.currentPlayer == 1 ? state.discardB : state.discardA,
    playArea: state.currentPlayer == 1 ? state.playAreaA : state.playAreaB,
    opponentPlayArea:
      state.currentPlayer == 1 ? state.playAreaB : state.playAreaA,
    turn: state.turn,
    subTurn: state.subTurn,
    activeTurn: false,
  };
}
