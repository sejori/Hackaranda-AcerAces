import { cardString } from "../helpers/cardString.js";
import {
  drawingMove,
  subTurn,
  type Card,
  type coord,
  type Hand,
  type move,
  type playArea,
  type playerState,
} from "../types.js";

export function getRandomMove(state: playerState<move>) {
  switch (state.subTurn) {
    case subTurn.FirstDraw:
    case subTurn.SecondDraw:
      return randomDrawMove(state);
    case subTurn.Play:
      return randomPlayMove(state);
    case subTurn.Discard:
      return randomDiscardMove(state);
  }
}

function randomDrawMove(state: playerState<move>) {
  const options: drawingMove[] = [];
  if (state.deck > 0) {
    options.push(drawingMove.Deck);
  }
  if (state.discard.length > 0) {
    options.push(drawingMove.OwnDiscard);
  }
  if (state.opponentDiscard.length > 0) {
    options.push(drawingMove.OpponentDiscard);
  }

  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex] as drawingMove;
}

export function randomPlayMove(state: playerState<move>) {
  const card = pickRandomCardFromHand(state.hand);
  const coord = pickRandomCardFromHand(
    getAllEmptySpaces(state.playArea),
  ) as unknown as coord;
  return { card, coord };
}

function getAllEmptySpaces(playArea: playArea) {
  const toView: coord[] = [[0, 0]];
  const visitedCards = new Set<string>();
  const emptySpaces: coord[] = [];
  while (toView.length) {
    const [x, y] = toView.pop() as coord;
    let card = playArea[x]?.[y];
    if (card === undefined) return [[x, y]] as coord[];
    visitedCards.add(cardString(card));

    let coordOptions: coord[] = [
      [x, y + 1],
      [x, y - 1],
      [x + 1, y],
      [x - 1, y],
    ];
    for (let [x, y] of coordOptions) {
      const card = playArea[x]?.[y];
      if (card === undefined) {
        emptySpaces.push([x, y]);
        continue;
      }
      if (visitedCards.has(cardString(card))) {
        continue;
      }
      toView.push([x, y]);
    }
  }
  return emptySpaces;
}

function pickRandomCardFromHand(hand: Hand | coord[]) {
  const randomIndex = Math.floor(Math.random() * hand.length);
  return hand[randomIndex] as Card;
}

function randomDiscardMove(state: playerState<move>) {
  return pickRandomCardFromHand(state.hand);
}
