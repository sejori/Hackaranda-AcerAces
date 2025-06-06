import { cardArr } from "../helpers/cardString.js";
import { checkLocationInPlayArea } from "../helpers/locationInPlayArea.js";
import {
  drawingMove,
  subTurn,
  type Card,
  type coord,
  type discardMove,
  type move,
  type playerState,
  type playMove,
} from "../types.js";

export function userMoveTranslate(move: any, state: playerState): move {
  switch (state.subTurn) {
    case subTurn.FirstDraw:
    case subTurn.SecondDraw:
      return drawMoveTranslate(move);
    case subTurn.Play:
      return playMoveTranslate(move, state);
    case subTurn.Discard:
      return discardMoveTranslate(move);
  }
}

function drawMoveTranslate(move: drawingMove) {
  return Number(move);
}

function discardMoveTranslate(move: string) {
  return cardArr(move);
}

function playMoveTranslate(move: string, state: playerState): playMove {
  const [selectedCard, direction, locationCard] = move.split(
    " ",
  ) as unknown as [string, "l" | "r" | "a" | "b", string];
  const card = cardArr(selectedCard);
  if (state.turn < 2) {
    return { card, coord: [0, 0] };
  }
  const lCard = cardArr(locationCard);
  const locationInPlayArea = checkLocationInPlayArea(
    state.playArea,
    lCard,
  ) as coord;

  const directionMap = { l: [-1, 0], r: [1, 0], a: [0, 1], b: [0, -1] };
  const directionCoord = directionMap[direction] as coord;
  const finalCoord = [
    locationInPlayArea[0] + directionCoord[0],
    locationInPlayArea[1] + directionCoord[1],
  ] as coord;

  return { card, coord: finalCoord };
}
