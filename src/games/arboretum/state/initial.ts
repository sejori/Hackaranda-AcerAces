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

export function getInitialGameState(
  initialState: false | gameState,
  playBack: boolean,
): gameState {
  const deck = initialState !== false ? initialState.deck : generateDeck();
  const handA = initialState !== false ? initialState.handA : [];
  const handB = initialState !== false ? initialState.handB : [];
  if (handA.length === 0 || handB.length == 0) {
    for (let i = 0; i < 7; i++) {
      handA.push(deck.pop() as Card);
      handB.push(deck.pop() as Card);
    }
  }
  // for (let i = 0; i < 20; i++) {
  //   deck.pop();
  // }
  const seenA = new Set(...handA.map((card) => cardString(card)));
  const seenB = new Set(...handB.map((card) => cardString(card)));

  return {
    deck: initialState !== false ? initialState.deck : deck,
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
    playBack: playBack,
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
