import { cardString } from "../helpers/cardString.js";
import {
  drawingMove,
  subTurn,
  type gameState,
  type move,
  type opponentHand,
  type playerState,
} from "../types.js";

export function getActivePlayerState(state: gameState): playerState<move> {
  let showPreviousTurn = false;
  if (state.subTurn === subTurn.FirstDraw) {
    showPreviousTurn = true;
  }
  const opponentHand = state.currentPlayer == 1 ? state.handA : state.handB;
  let seen = state.currentPlayer == 0 ? state.seenA : state.seenB;
  const opponentFilteredHand = opponentHand.map((card) =>
    seen.has(cardString(card)) ? card : null,
  );
  return {
    deck: state.deck.length,
    hand: state.currentPlayer == 0 ? state.handA : state.handB,
    discard: state.currentPlayer == 0 ? state.discardA : state.discardB,
    opponentDiscard: state.currentPlayer == 0 ? state.discardB : state.discardA,
    playArea: state.currentPlayer == 0 ? state.playAreaA : state.playAreaB,
    opponentPlayArea:
      state.currentPlayer == 0 ? state.playAreaB : state.playAreaA,
    opponentHand: state.playBack ? opponentHand : opponentFilteredHand,
    turn: state.turn,
    subTurn: state.subTurn,
    previousTurn: {
      move: state.previousTurn,
      metaData: state.previousTurnMetaData,
    },
    activeTurn: true,
    showPreviousTurn,
    opponent: state.playBack ? state.opponent : "",
  };
}

export function getInactivePlayerState(state: gameState): playerState<move> {
  let showPreviousTurn = true;
  if (state.subTurn === subTurn.FirstDraw) {
    showPreviousTurn = false;
  }
  let previousTurn = {
    move: state.previousTurn,
    metaData: state.previousTurnMetaData,
  };
  if (state.previousTurn === drawingMove.Deck) {
    previousTurn = { move: false, metaData: false };
  }
  const opponentHand = state.currentPlayer == 0 ? state.handA : state.handB;
  let seen = state.currentPlayer == 1 ? state.seenA : state.seenB;
  const opponentFilteredHand = opponentHand.map((card) =>
    seen.has(cardString(card)) ? card : null,
  );
  return {
    deck: state.deck.length,
    hand: state.currentPlayer == 1 ? state.handA : state.handB,
    discard: state.currentPlayer == 1 ? state.discardA : state.discardB,
    opponentDiscard: state.currentPlayer == 1 ? state.discardB : state.discardA,
    playArea: state.currentPlayer == 1 ? state.playAreaA : state.playAreaB,
    opponentPlayArea:
      state.currentPlayer == 1 ? state.playAreaB : state.playAreaA,
    opponentHand: state.playBack ? opponentHand : opponentFilteredHand,
    turn: state.turn,
    subTurn: state.subTurn,
    previousTurn: {
      move: state.previousTurn,
      metaData: state.previousTurnMetaData,
    },
    activeTurn: false,
    showPreviousTurn,
    opponent: state.playBack ? state.opponent : "",
  };
}
