import chalk from "chalk";
import type {
  Card,
  coord,
  Deck,
  opponentHand,
  playArea,
  species,
} from "../types.js";
import { cardString } from "./cardString.js";
import { getBorderCharacters, table } from "table";

export function niceDeck(
  deck: Deck,
  joiner = " ",
  underline: false | "first" | "last" = false,
  reverse = false,
) {
  let newDeck = deck.map((card, index) => {
    let newCard = assignColour(cardString(card));
    if (underline === "last" && index == deck.length - 1) {
      newCard = chalk.underline(newCard);
    }
    if (underline === "first" && index == deck.length - 1) {
      newCard = chalk.underline(newCard);
    }
    return newCard;
  });
  if (reverse) {
    newDeck = newDeck.reverse();
  }
  return newDeck.join(joiner);
}

export function sortDeck(deck: Deck) {
  const newDeck = [...deck];
  newDeck.sort((a, b) => {
    const speciesDifference = b[0].charCodeAt(0) - a[0].charCodeAt(0);
    if (speciesDifference !== 0) {
      return speciesDifference;
    }
    return a[1] - b[1];
  });
  return newDeck;
}

export function fancyDeck(deck: Deck | opponentHand, joiner = " ") {
  let newDeck = deck.map((card) =>
    card === null ? niceUnknownCard() : niceCard(card),
  );
  return table([newDeck], { border: getBorderCharacters("void") });
}

const colourMap: Record<species, string> = {
  C: "#FFFF00",
  J: "#800080",
  R: "#FFA500",
  M: "#FF0000",
  O: "8B4513",
  W: "006400",
};
export function colorForSpecies(species: species) {
  const hexColour = colourMap[species as species];
  return chalk.hex(hexColour ?? "#FFFFFF");
}
export function assignColour(card: string) {
  if (process.env.NOCOLOUR) {
    return card;
  }
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

export function nicePlayArea(
  playArea: playArea,
  padding = "",
  isNiceCard = false,
) {
  const out = nicePlayAreaArr(playArea, isNiceCard, padding);
  if (out.length === 0) {
    return "";
  }
  return table(out, {
    border: getBorderCharacters("norc"),
    drawHorizontalLine: (i, l) => i === 0 || i === l,
    drawVerticalLine: (i, l) => i === 0 || i === l,
  });
}

export function nicePlayAreaArr(
  playArea: playArea,
  isNiceCard = false,
  padding = "",
) {
  const cards: [Card, coord][] = [];
  let maxX = -Infinity;
  let minX = Infinity;
  let maxY = -Infinity;
  let minY = Infinity;
  for (let xCoord of Object.keys(playArea)) {
    const col = playArea[Number(xCoord)];
    if (col === undefined) {
      continue;
    }

    if (Number(xCoord) > maxX) {
      maxX = Number(xCoord);
    }
    if (Number(xCoord) < minX) {
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
      }
      if (Number(yCoord) < minY) {
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
    row[y - minY] = isNiceCard
      ? niceCard(card)
      : assignColour(cardString(card));
  }

  let out = [];
  for (let i = (board[0]?.length ?? 0) - 1; i >= 0; i--) {
    let row = [];
    for (let j = 0; j < board.length; j++) {
      row.push(board[j]?.[i]);
    }
    if (padding !== "") {
      out.push([padding, ...row]);
    } else {
      out.push(row);
    }
  }
  return out;
}

function niceCard(card: Card) {
  let species = card[0] as string;
  let rank = `${card[1]}`;
  if (process.env.NOCOLOUR === undefined) {
    const colour = colorForSpecies(card[0]);
    species = colour(card[0]);
    rank = colour(card[1]);
  }
  // const data = [
  //   [rank, " ", rank],
  //   [" ", " ", " "],
  //   [" ", species + rank, " "],
  //   [" ", " ", " "],
  //   [rank, " ", rank],
  // ];
  const data = [
    [`${rank}  ${rank}`],
    [`${species}${rank}`],
    [`${rank}  ${rank}`],
  ];
  let out = table(data, {
    columnDefault: {
      alignment: "center",
      verticalAlignment: "middle",
    },
    drawHorizontalLine: (index, le) => index == 0 || index == le,
    drawVerticalLine: (index, le) => index == 0 || index == le,
  });
  return out.slice(0, out.length - 1);
}
function niceUnknownCard() {
  // const data = [
  //   ["/", "/", "/"],
  //   ["/", "/", "/"],
  //   ["/", "/", "/"],
  //   ["/", "/", "/"],
  //   ["/", "/", "/"],
  // ];
  const data = [[`////`], [`////`], [`////`]];
  let out = table(data, {
    drawHorizontalLine: (index, le) => index == 0 || index == le,
    drawVerticalLine: (index, le) => index == 0 || index == le,
  });
  return out.slice(0, out.length - 1);
}
