import {
  getCurrentDiscard,
  getOpponentDiscard,
} from "../helpers/getDiscard.js";
import { getCurrentHand } from "../helpers/getHand.js";
import { getCurrentPlayArea } from "../helpers/getPlayArea.js";
import {
  drawingMove,
  subTurn,
  type discardMove,
  type gameState,
  type move,
  type playMove,
} from "../types.js";

export function isValidMove(state: gameState, move: move) {
  switch (state.subTurn) {
    case subTurn.FirstDraw:
    case subTurn.SecondDraw:
      return validateDrawMove(state, move as drawingMove);
    case subTurn.Play:
      return validatePlayMove(state, move as playMove);
    case subTurn.Discard:
      return validateDiscardMove(state, move as discardMove);
  }
}

function validateDrawMove(state: gameState, move: drawingMove) {
  if (move === drawingMove.Deck) {
    return state.deck.length > 0;
  }
  if (move === drawingMove.OwnDiscard) {
    return getCurrentDiscard(state).length > 0;
  }
  if (move === drawingMove.OpponentDiscard) {
    return getOpponentDiscard(state).length > 0;
  }
  return false;
}

function validatePlayMove(state: gameState, move: playMove) {
  const playArea = getCurrentPlayArea(state);
  if (move.coord == undefined || move.card == undefined) {
    return false;
  }
  const [x, y] = move.coord;
  const currentCard = playArea[x]?.[y];
  if (currentCard !== undefined) {
    console.log("current card is not undefined", { move, playArea });
    return false;
  }

  const hand = getCurrentHand(state);
  const cardToPlay = move.card;
  const cardInHand = hand.some(
    (card) =>
      card[0] === cardToPlay[0].toUpperCase() && card[1] === cardToPlay[1],
  );
  if (!cardInHand) {
    console.log("Card not in hand");
  }
  return cardInHand;
}

function validateDiscardMove(state: gameState, move: discardMove) {
  if (move === undefined || move[0] === undefined || move[1] === undefined) {
    return false;
  }
  const hand = getCurrentHand(state);
  return hand.some((card) => card[0] === move[0] && card[1] === move[1]);
}
