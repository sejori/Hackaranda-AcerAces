import { probabilityScoreSpecies } from "./probabilities.js";
import type { Card, Hand, move, playerState, species } from "./types.js";

function randomDrawMove(state: playerState<move>) {
  const options = [];
  if (state.deck > 0) {
    options.push(0);
  }
  if (state.discard.length > 0) {
    options.push(1);
  }
  if (state.opponentDiscard.length > 0) {
    options.push(2);
  }

  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}
export function drawMove(state: playerState<move>) {
  return randomDrawMove(state);
  const mostCommonSpecies = getMostCommonSpeciesFromHand(state.hand);
  let bestProb = -Infinity;
  let bestDraw: (0 | 1 | 2)[] = [];

  const options: (0 | 1 | 2)[] = [];
  if (state.deck > 0) {
    options.push(0);
  }
  if (state.discard.length > 0) {
    const target = state.discard[state.discard.length - 1] as Card;
    let species = target[0];
    const prob = probabilityScoreSpecies(
      [target, ...state.hand],
      state.opponentHand,
      state.discard.filter(
        (card) => card[0] !== target[0] || card[1] !== target[1],
      ),
      state.opponentDiscard,
      state.playArea,
      state.opponentPlayArea,
      species,
    )[0] as number;
    if (prob > bestProb) {
      bestProb = prob;
      bestDraw = [1];
    } else if (prob == bestProb) {
      bestDraw.push(1);
    }
    options.push(1);
  }
  if (state.opponentDiscard.length > 0) {
    const target = state.opponentDiscard[
      state.opponentDiscard.length - 1
    ] as Card;
    let species = target[0];
    const prob = probabilityScoreSpecies(
      [target, ...state.hand],
      state.opponentHand,
      state.discard,
      state.opponentDiscard.filter(
        (card) => card[0] !== target[0] || card[1] !== target[1],
      ),
      state.playArea,
      state.opponentPlayArea,
      species,
    )[0] as number;
    if (prob > bestProb) {
      bestProb = prob;
      bestDraw = [2];
    } else if (prob == bestProb) {
      bestDraw.push(2);
    }
    options.push(2);
  }

  // if (bestDraw.length > 0) {
  //   const randomIndex = Math.floor(Math.random() * bestDraw.length);
  //   return bestDraw[randomIndex];
  // }
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

function getMostCommonSpeciesFromHand(hand: Hand) {
  let mostCommonSpecies: species = "J";
  let mostCommonSpeciesCount = -Infinity;
  const countBySpecies: Record<species, number> = {
    R: 0,
    M: 0,
    O: 0,
    W: 0,
    J: 0,
    C: 0,
  };

  for (let card of hand) {
    const [species, _] = card;
    (countBySpecies[species] as number) += 1;
    let currentCount = countBySpecies[species] as number;
    if (currentCount > mostCommonSpeciesCount) {
      mostCommonSpecies = species;
      mostCommonSpeciesCount = currentCount;
    }
  }
  return mostCommonSpecies;
}
