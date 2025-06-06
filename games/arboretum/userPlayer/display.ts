import { cardString } from "../helpers/cardString.js";
import {
  subTurn,
  type Card,
  type coord,
  type Deck,
  type playArea,
  type playerState,
} from "../types.js";

export function displayForUser(state: playerState) {
  console.clear();
  console.log("Hand:", niceDeck(state.hand));
  console.log("Cards in Deck:", state.deck);
  console.log("Discard:", niceDeck(state.discard));
  console.log("Opponent's discard:", niceDeck(state.opponentDiscard));
  console.log("Play Area:");
  nicePlayArea(state.playArea);
  console.log("Opponent's play area:");
  nicePlayArea(state.opponentPlayArea);
  console.log("Current turn:", subTurnMap[state.subTurn]);
}

export function userMoveMessage(state: playerState) {
  switch (state.subTurn) {
    case subTurn.FirstDraw:
    case subTurn.SecondDraw:
      return "Choose draw pile (0: Deck. 1: Discard. 2: Opponent Discard)";
    case subTurn.Play:
      return state.turn < 2
        ? "Choose card to play in the centre"
        : "Choose card to play, and where to place it (e.g. 'A1 C3 l')";
    case subTurn.Discard:
      return "Choose card to discard (e.g. 'A1')";
  }
}

const subTurnMap = [
  "First draw",
  "Second draw",
  "Play card into area",
  "Discard",
];
function niceDeck(deck: Deck) {
  return deck.map((card) => cardString(card)).join(" ");
}

function nicePlayArea(playArea: playArea, padding = "") {
  const cards: [Card, coord][] = [];
  let maxX = 0;
  let minX = 0;
  let maxY = 0;
  let minY = 0;
  for (let xCoord of Object.keys(playArea)) {
    const col = playArea[Number(xCoord)];
    if (col === undefined) {
      continue;
    }

    if (Number(xCoord) > maxX) {
      maxX = Number(xCoord);
    } else if (Number(xCoord) < minX) {
      minX = Number(xCoord);
    }

    const yCoords = Object.keys(col);
    for (let yCoord of yCoords) {
      const card = col[Number(yCoord)];
      if (card === undefined) {
        continue;
      }
      if (Number(yCoord) > maxY) {
        maxY = Number(yCoord);
      } else if (Number(yCoord) < minY) {
        minY = Number(yCoord);
      }
      cards.push([card, [Number(xCoord), Number(yCoord)]]);
    }
  }

  let xLength = maxX - minX + 1;
  let yLength = maxY - minY + 1;
  const board = [];
  for (let i = 0; i < xLength; i++) {
    const row = [];
    for (let j = 0; j < yLength; j++) {
      row.push("  ");
    }
    board.push(row);
  }
  for (let [card, [x, y]] of cards) {
    let row = board[x - minX];
    if (row == undefined) {
      continue;
    }
    row[y - minY] = cardString(card);
  }

  for (let i = (board[0]?.length ?? 0) - 1; i >= 0; i--) {
    let row = " ";
    for (let j = 0; j < board.length; j++) {
      row += board[j]?.[i] + " ";
    }
    console.log(padding + row);
  }
}
