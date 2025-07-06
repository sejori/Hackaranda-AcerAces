import {
  drawingMove,
  subTurn,
  type Card,
  type discardMove,
  type move,
  type playerState,
  type playMove,
} from "../types.js";
import {
  assignColour,
  fancyDeck,
  niceDeck,
  nicePlayArea,
  sortDeck,
} from "../helpers/ui.js";
import { confirm } from "@inquirer/prompts";
import cliui from "cliui";
import figlet from "figlet";
import { cardString } from "../helpers/cardString.js";
import { setTimeout } from "node:timers/promises";

export function displayForUser(
  state: playerState<move>,
  identifier: string,
  game: number,
  round: string,
) {
  const ui = cliui();
  console.clear();
  const leftDiv = [];
  leftDiv.push((identifier + "'s " || "Your ") + "Play Area");
  leftDiv.push(nicePlayArea(state.playArea, "", true));
  const rightDiv = [];
  rightDiv.push((state.opponent || "Opponent") + "'s play area");
  rightDiv.push(nicePlayArea(state.opponentPlayArea, "", true));
  ui.div({
    text: figlet.textSync("ARBORETUM", { font: "AMC Tubes" }),
    align: "center",
  });
  ui.div({ text: `Round: ${round}, Game: ${game}`, align: "center" });
  ui.div(
    {
      text: leftDiv.join("\n"),
      align: "center",
    },
    { text: rightDiv.join("\n"), align: "center" },
  );
  ui.div({ text: "---------------", align: "center" });
  ui.div(
    {
      text:
        niceDeck(state.discard, " ", "last") +
        ` :${identifier + "'s" || "Your"} Discard`,
      align: "right",
    },
    {
      text: "| Cards in Deck: " + state.deck + " |",
      align: "center",
    },
    {
      text:
        (state.opponent || "Opponent") +
        "'s discard: " +
        niceDeck(state.opponentDiscard, " ", "last", true),
      align: "left",
    },
  );
  ui.div({ text: "---------------", align: "center" });
  ui.div(
    { text: (identifier + "'s " || "Your ") + "Hand", align: "center" },
    {
      text: (state.opponent + "'s " || "Opponent's ") + "Hand",
      align: "center",
    },
  );
  ui.div(
    { text: fancyDeck(sortDeck(state.hand)), align: "center" },
    { text: fancyDeck(state.opponentHand), align: "center" },
  );

  console.log(ui.toString());
  if (!state.showPreviousTurn && state.previousTurn) {
    console.log(friendlyPreviousTurn(state));
  }
  console.log("Current turn:", subTurnMap[state.subTurn]);
}

export function userMoveMessage(state: playerState<move>) {
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
export async function showPreviousTurn(
  gameState: playerState<move>,
  identifier: string,
  game: number,
  round: string,
  continueMethod: number | "enter" = "enter",
) {
  const newGameState = {
    ...gameState,
    subTurn: getPreviousSubTurn(gameState.subTurn),
  };
  displayForUser(newGameState, identifier, game, round);
  console.log(friendlyPreviousTurn(gameState));
  if (continueMethod === "enter") {
    await confirm({ message: "Continue?" });
  } else {
    await setTimeout(continueMethod);
  }
}

function friendlyPreviousTurn(gameState: playerState<move>) {
  const { move, metaData } = gameState.previousTurn;
  switch (getPreviousSubTurn(gameState.subTurn)) {
    case subTurn.FirstDraw:
    case subTurn.SecondDraw:
      return friendlyDraw(move as drawingMove, metaData, gameState.activeTurn);
    case subTurn.Play:
      return friendlyPlay(move as playMove, gameState.activeTurn);
    case subTurn.Discard:
      return friendlyDiscard(move as discardMove, gameState.activeTurn);
  }
}

function friendlyDraw(
  move: drawingMove,
  metaData: false | Card,
  active: boolean,
) {
  switch (move) {
    case drawingMove.Deck:
      return (
        (active
          ? `You drew ${assignColour(cardString(metaData as Card))}`
          : "Opponent draws") + " from the deck"
      );
    case drawingMove.OwnDiscard:
      return (
        (active ? "You drew" : "Opponent draws") +
        ` ${assignColour(cardString(metaData as Card))} from ` +
        (active ? "your" : "opponent's") +
        " discard"
      );
    case drawingMove.OpponentDiscard:
      return (
        (active ? "You drew" : "Opponent draws") +
        ` ${assignColour(cardString(metaData as Card))} from ` +
        (active ? "opponent's" : "your") +
        " discard"
      );
  }
}

function friendlyPlay(move: playMove, active: boolean) {
  return (
    (active ? "You played" : "Opponent plays") +
    ` the card ${assignColour(cardString(move.card))}`
  );
}

function friendlyDiscard(move: discardMove, active: boolean) {
  return (
    (!active ? `You discarded` : "Opponent discards") +
    ` ${assignColour(cardString(move))}`
  );
}

function getPreviousSubTurn(currentSubTurn: subTurn) {
  switch (currentSubTurn) {
    case subTurn.FirstDraw:
      return subTurn.Discard;
    case subTurn.SecondDraw:
      return subTurn.FirstDraw;
    case subTurn.Play:
      return subTurn.SecondDraw;
    case subTurn.Discard:
      return subTurn.Play;
  }
}

const subTurnMap = [
  "First draw",
  "Second draw",
  "Play card into area",
  "Discard",
];
