import { subTurn, type playerState } from "../types.js";
import { niceDeck, nicePlayArea } from "../helpers/ui.js";

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
        : "Choose card to play, and where to place it (e.g. 'A1 a(bove)/b(elow)/l(eft)/r(ight) C3')";
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
