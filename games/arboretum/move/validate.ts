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
  const [x, y] = move.coord;
  const currentCard = playArea[x]?.[y];
  if (currentCard !== undefined) {
    return false;
  }

  const hand = getCurrentHand(state);
  const cardToPlay = move.card;
  return hand.some(
    (card) => card[0] === cardToPlay[0] && card[1] === cardToPlay[1],
  );
}

function validateDiscardMove(state: gameState, move: discardMove) {
  const hand = getCurrentHand(state);
  return hand.some((card) => card[0] === move[0] && card[1] === move[1]);
}
