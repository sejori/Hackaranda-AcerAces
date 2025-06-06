import { cardArr } from "../helpers/cardString.js";
import { checkLocationInPlayArea } from "../helpers/locationInPlayArea.js";
import {
  drawingMove,
  subTurn,
  type Card,
  type coord,
  type playArea,
  type playerState,
  type userMove,
} from "../types.js";

export function userMoveOptions(state: playerState) {
  switch (state.subTurn) {
    case subTurn.FirstDraw:
    case subTurn.SecondDraw:
      return userDrawOptions(state);
    case subTurn.Play:
      return "Choose card to play, and where to place it (e.g. 'A1 C3 l')";
    case subTurn.Discard:
      return "Choose card to discard (e.g. 'A1')";
  }
}

function userDrawOptions(state: playerState) {
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
  return options;
}

export function playerMoveValidator(state: playerState) {
  switch (state.subTurn) {
    case subTurn.FirstDraw:
    case subTurn.SecondDraw:
      return userDrawValidator(state);
    case subTurn.Play:
      return userPlayValidator(state);
    case subTurn.Discard:
      return userDiscardValidator(state);
  }
}

function userDrawValidator(state: playerState) {
  const options = userDrawOptions(state);
  return function (choice: userMove) {
    choice = choice as drawingMove;
    if (options.includes(Number(choice))) {
      return true;
    }
    return "Invalid draw location" + options;
  };
}

function userPlayValidator(state: playerState) {
  return function (choice: userMove) {
    choice = choice as string;
    try {
      const [sCard, direction, lCard] = choice.split(" ") as unknown as [
        string,
        "l" | "r" | "a" | "b",
        string,
      ];
      const selectedCard = cardArr(sCard);

      const cardInHand = state.hand.some(
        (card) =>
          card[0] === selectedCard[0].toUpperCase() &&
          card[1] == selectedCard[1],
      );
      if (!cardInHand) {
        return "Card not in hand";
      }

      if (state.turn < 2) {
        return true;
      }

      if (lCard == undefined) {
        return "Invalid location card";
      }
      if (direction == undefined) {
        return "Invalid direction (l|r|a|b)";
      }

      const locationCard = cardArr(lCard);

      const locationInPlayArea = checkLocationInPlayArea(
        state.playArea,
        locationCard,
      );
      if (!locationInPlayArea) {
        return "Card not in play area";
      }

      if (!["l", "r", "a", "b"].includes(direction.toLowerCase())) {
        return "not a valid direction";
      }

      const directionMap = { l: [-1, 0], r: [1, 0], a: [0, 1], b: [0, -1] };
      const directionCoord = directionMap[direction] as coord;
      const directionCheck = [
        locationInPlayArea[0] + directionCoord[0],
        locationInPlayArea[1] + directionCoord[1],
      ] as coord;

      const cardAtLocation =
        state.playArea[directionCheck[0]]?.[directionCheck[1]];
      if (cardAtLocation !== undefined) {
        return "Card already at location";
      }

      return true;
    } catch (e) {
      console.log(e);
      return "error";
    }
  };
}

function userDiscardValidator(state: playerState) {
  return function (choice: userMove) {
    choice = choice as Card;
    const cardInHand = state.hand.some(
      (card) => card[0] === choice[0].toUpperCase() && card[1] == choice[1],
    );
    if (cardInHand) {
      return true;
    }
    return "card not in hand";
  };
}
