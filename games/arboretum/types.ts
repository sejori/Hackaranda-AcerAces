import type { ObjectValues } from "../../helpers/objectValues.js";

export type species = "J" | "R" | "C" | "M" | "O" | "W";
export const species: species[] = ["J", "R", "C", "M", "O", "W"];
export type rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const ranks: rank[] = [1, 2, 3, 4, 5, 6, 7, 8];
export type Card = [species, rank];

export type Deck = Card[];
export type path = Card[];
export type Hand = Deck;
export type Discard = Deck;

/**
 * Arboretum play area. Grid from playArea.x.y is the Card at (x, y).
 */
export type playArea = Record<number, Record<number, Card>>;
export type coord = [number, number];

export type turn = number;
export enum subTurn {
  FirstDraw,
  SecondDraw,
  Play,
  Discard,
}

export type gameState = {
  /** Game deck and draw pile */
  deck: Deck;
  /** Player A's hand */
  handA: Hand;
  /** Player B's hand */
  handB: Hand;
  /** Player A's discard */
  discardA: Hand;
  /** Player B's discard */
  discardB: Hand;
  /** Player A's playArea */
  playAreaA: playArea;
  /** Player B's playArea */
  playAreaB: playArea;
  /** Current turn number */
  turn: turn;
  /** Current sub turn */
  subTurn: subTurn;
  /** Current player */
  currentPlayer: number;
  opponent: string;
};

export type playerState = {
  /** Cards remaining in deck */
  deck: number;
  /** Player's hand */
  hand: Hand;
  /** Player's Discard Pile */
  discard: Discard;
  /** Opponent's Discard Pile*/
  opponentDiscard: Discard;
  /** play area */
  playArea: playArea;
  /** Opponent's play area */
  opponentPlayArea: playArea;
  /** Current turn */
  turn: turn;
  /** Current sub turn */
  subTurn: subTurn;
  /** Is player active */
  activeTurn: boolean;
};

export enum drawingMove {
  Deck,
  OwnDiscard,
  OpponentDiscard,
}

export type playMove = {
  card: Card;
  coord: [number, number];
};

export type discardMove = Card;

export type move = drawingMove | playMove | discardMove;

export type userMove = Card | string | drawingMove;

export type pathScore = { path: path; score: number; species: species };
export type winMetaData = {
  aScore: number;
  aPaths: pathScore[];
  bScore: number;
  bPaths: pathScore[];
};
