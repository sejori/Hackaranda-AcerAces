import chalk from "chalk";
import type { Card, coord, Deck, playArea, species } from "../types.js";
import { cardString } from "./cardString.js";

export function niceDeck(deck: Deck, joiner = " ") {
  return deck.map((card) => assignColour(cardString(card))).join(joiner);
}

export function assignColour(card: string) {
  const colourMap: Record<species, string> = {
    C: "#FFFF00",
    J: "#800080",
    R: "#FFA500",
    M: "#FF0000",
    O: "8B4513",
    W: "006400",
  };
  const species = card[0];
  if (species === undefined) {
    return "";
  }
  const hexColour = colourMap[species as species];
  return chalk.hex(hexColour)(card);
}

export function extractFromPlayArea(playArea: playArea, cards: Card[]) {
  const newPlayArea: playArea = {};
  const allCards: Record<string, coord> = {};
  for (let x of Object.keys(playArea)) {
    const row = playArea[Number(x)] as playArea[number];
    for (let y of Object.keys(row)) {
      const card = row[Number(y)] as Card;
      allCards[cardString(card)] = [Number(x), Number(y)];
    }
  }

  for (let card of cards) {
    let coord = allCards[cardString(card)];
    if (coord === undefined) {
      continue;
    }
    const [x, y] = coord;
    let row = newPlayArea[x];
    if (row == undefined) {
      newPlayArea[x] = {};
      row = newPlayArea[x];
    }
    row[y] = card;
  }
  return newPlayArea;
}

export function nicePlayArea(playArea: playArea, padding = "") {
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
    row[y - minY] = assignColour(cardString(card));
  }

  for (let i = (board[0]?.length ?? 0) - 1; i >= 0; i--) {
    let row = " ";
    for (let j = 0; j < board.length; j++) {
      row += board[j]?.[i] + " ";
    }
    console.log(padding + row);
  }
}
