import { cardString } from "../helpers/cardString.js";
import {
  type Deck,
  type gameState,
  species,
  type Card,
  type Discard,
  type playArea,
  subTurn,
  ranks,
} from "../types.js";

export function getInitialGameState(): gameState {
  const deck = generateDeck();
  const handA = [];
  const handB = [];
  for (let i = 0; i < 7; i++) {
    handA.push(deck.pop() as Card);
    handB.push(deck.pop() as Card);
  }
  // for (let i = 0; i < 20; i++) {
  //   deck.pop();
  // }
  const seenA = new Set(...handA.map((card) => cardString(card)));
  const seenB = new Set(...handB.map((card) => cardString(card)));

  return {
    deck,
    handA,
    handB,
    discardA: [] as Discard,
    discardB: [] as Discard,
    playAreaA: {} as playArea,
    playAreaB: {} as playArea,
    seenA,
    seenB,
    turn: 0,
    subTurn: subTurn.FirstDraw,
    currentPlayer: 0,
    opponent: "",
    previousTurn: false,
    previousTurnMetaData: false,
  };
}

function generateDeck() {
  const deck: Deck = [];
  for (let aSpecies of species) {
    for (let rank of ranks) {
      deck.push([aSpecies, rank]);
    }
  }
  shuffleDeck(deck);
  return deck;
}

function shuffleDeck(deck: Deck) {
  let currentIndex = deck.length;
  while (currentIndex != 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [deck[currentIndex], deck[randomIndex]] = [
      deck[randomIndex] as Card,
      deck[currentIndex] as Card,
    ];
  }
}
