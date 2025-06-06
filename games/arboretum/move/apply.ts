import {
  getCurrentDiscard,
  getOpponentDiscard,
} from "../helpers/getDiscard.js";
import { getCurrentHand } from "../helpers/getHand.js";
import { getCurrentPlayArea } from "../helpers/getPlayArea.js";
import {
  drawingMove,
  subTurn,
  type Card,
  type discardMove,
  type gameState,
  type move,
  type playMove,
} from "../types.js";

export function applyMove(state: gameState, move: move): gameState {
  switch (state.subTurn) {
    case subTurn.FirstDraw:
      return applyFirstDrawMove(state, move as drawingMove);
    case subTurn.SecondDraw:
      return applySecondDrawMove(state, move as drawingMove);
    case subTurn.Play:
      return applyPlayMove(state, move as playMove);
    case subTurn.Discard:
      return applyDiscardMove(state, move as discardMove);
  }
}

function applyDrawMove(state: gameState, move: drawingMove): gameState {
  let deck;
  if (move === drawingMove.Deck) {
    deck = state.deck;
  } else if (move === drawingMove.OwnDiscard) {
    deck = getCurrentDiscard(state);
  } else {
    deck = getOpponentDiscard(state);
  }
  let cardDrawn = deck.pop() as Card;
  const hand = getCurrentHand(state);
  hand.push(cardDrawn);

  return state;
}

function applyFirstDrawMove(state: gameState, move: drawingMove) {
  const updatedState = applyDrawMove(state, move);
  updatedState.subTurn = subTurn.SecondDraw;
  return updatedState;
}

function applySecondDrawMove(state: gameState, move: drawingMove) {
  const updatedState = applyDrawMove(state, move);
  updatedState.subTurn = subTurn.Play;
  return updatedState;
}

function applyPlayMove(state: gameState, move: playMove) {
  const playArea = getCurrentPlayArea(state);
  const [x, y] = move.coord;
  let col = playArea[x];
  if (col === undefined) {
    playArea[x] = {};
    col = playArea[x];
  }
  col[y] = move.card;

  const hand = getCurrentHand(state);
  const newHand = hand.filter((card) => {
    const res = card[0] !== move.card[0] || card[1] !== move.card[1];
    return res;
  });
  if (state.currentPlayer === 0) {
    state.handA = newHand;
  } else {
    state.handB = newHand;
  }
  state.subTurn = subTurn.Discard;
  //console.log(playArea);
  return state;
}

function applyDiscardMove(state: gameState, move: discardMove) {
  const hand = getCurrentHand(state);
  const newHand = hand.filter((card) => {
    const res = card[0] !== move[0] || card[1] !== move[1];
    return res;
  });
  if (state.currentPlayer === 0) {
    state.handA = newHand;
    state.discardA.push(move);
  } else {
    state.handB = newHand;
    state.discardB.push(move);
  }

  state.subTurn = subTurn.FirstDraw;
  state.turn += 1;
  state.currentPlayer = state.currentPlayer ? 0 : 1;
  return state;
}
