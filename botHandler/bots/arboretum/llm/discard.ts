import { scorePlayArea, totalScore } from "./helpers/scoring.js";
import { probabilityScoreSpecies, spareCards } from "./probabilities.js";
import type { Card, Hand, move, playerState } from "./types.js";
import { species } from "./types.js";

function pickLowestCardFromHand(hand: Hand) {
  let lowestCard = hand[0] as Card;
  for (let card of hand) {
    if (card[1] < lowestCard[1]) {
      lowestCard = card;
    }
  }
  return lowestCard;
}
function probThreshold(threshold: number) {
  return (prob: number) => {
    if (prob < threshold) {
      return 0;
    }
    return prob;
  };
}
function smartDiscard(state: playerState<move>) {
  const availableCards = spareCards(state);
  return pickLowestCardFromHand(availableCards);
  let bestCards = [pickLowestCardFromHand(state.hand)];
  let bestScore = -Infinity;
  const threshold = probThreshold(1);
  for (let card of state.hand) {
    let cardScore = 0;
    for (let aSpecies of species) {
      const [winP, drawP, lossP] = probabilityScoreSpecies(
        state.hand.filter(
          (handCard) => handCard[0] !== card[0] || handCard[1] !== card[1],
        ),
        state.opponentHand,
        [card, ...state.discard],
        state.opponentDiscard,
        state.playArea,
        state.opponentPlayArea,
        aSpecies,
      ) as [number, number, number];
      const score = scorePlayArea(state.playArea, aSpecies);
      const opponentScore = scorePlayArea(state.opponentPlayArea, aSpecies);
      const diff =
        (threshold(winP) + threshold(drawP)) * score[0] -
        (threshold(drawP) + threshold(lossP)) * opponentScore[0];
      cardScore += diff;
    }
    if (cardScore > bestScore) {
      bestCards = [card];
    } else if (cardScore == bestScore) {
      bestCards.push(card);
    }
  }
  return pickLowestCardFromHand(bestCards);
}

function pickRarestCardFromHand(hand: Hand) {
  let rarestSpecies: species;
  let rarestSpeciesCount = Infinity;
  const countBySpecies: Record<species, number> = {
    J: 0,
    R: 0,
    C: 0,
    M: 0,
    O: 0,
    W: 0,
  };

  for (let card of hand) {
    const [species, _] = card;
    let currentCount = countBySpecies[species];
    if (currentCount == undefined) {
      countBySpecies[species] = 1;
    } else {
      countBySpecies[species] += 1;
    }
    currentCount = countBySpecies[species];
    if (currentCount < rarestSpeciesCount) {
      rarestSpecies = species;
      rarestSpeciesCount = currentCount;
    }
  }
  return pickLowestCardFromHand(
    hand.filter((card) => card[0] == rarestSpecies),
  );
}

function pickRandomCardFromHand(hand: Hand) {
  const randomIndex = Math.floor(Math.random() * hand.length);
  return hand[randomIndex];
}

export function discardMove(state: playerState<move>) {
  // return pickLowestCardFromHand(state.hand);
  return smartDiscard(state);
}
