import { cardString } from "./helpers/cardString.js";
import { getCardsFromPlayArea } from "./helpers/getCardsFromPlayArea.js";
import { scorePlayArea } from "./helpers/scoring.js";
import {
  species,
  type Card,
  type Discard,
  type Hand,
  type move,
  type opponentHand,
  type playArea,
  type playerState,
  type rank,
} from "./types.js";

/**
 * Calculate which cards from your hand can be discarded or played
 */
export function spareCards(state: playerState<move>, play = false) {
  const stats = cardStats(state);
  const availableCards: [Card, number][] = [];
  for (let card of state.hand) {
    const [species, rank] = card;
    const [handScore, opponentHandScore, remainingScore, score, opponentScore] =
      stats[species];
    let calc = handScore - opponentHandScore - remainingScore - rank;
    if (!play) {
      calc -= rank;
    }
    if (calc > 0) {
      if (rank === 7) {
        availableCards.push([card, 0.5]);
        continue;
      }
      availableCards.push([card, 1]);
      continue;
    }
    if (opponentScore === 0) {
      availableCards.push([card, 0.6]);
      continue;
    }
    if (score - opponentScore > 0) {
      availableCards.push([card, 0.6]);
      continue;
    }
  }
  // console.error(availableCards);
  {
    const cards = availableCards.filter((stat) => stat[1] === 1);
    if (cards.length > 0) {
      return cards.map((stat) => stat[0]);
    }
  }
  {
    const cards = availableCards.filter((stat) => stat[1] === 0.6);
    if (cards.length > 0) {
      return cards.map((stat) => stat[0]);
    }
  }
  {
    const cards = availableCards.filter((stat) => stat[1] === 0.5);
    if (cards.length > 0) {
      return cards.map((stat) => stat[0]);
    }
  }
  return state.hand;
}

export function cardStats(state: playerState<move>) {
  const stats: Record<species, [number, number, number, number, number]> = {
    J: [0, 0, 0, 0, 0],
    R: [0, 0, 0, 0, 0],
    C: [0, 0, 0, 0, 0],
    M: [0, 0, 0, 0, 0],
    O: [0, 0, 0, 0, 0],
    W: [0, 0, 0, 0, 0],
  };
  for (let aSpecies of species) {
    let allCards: Hand = [];
    for (let i = 1; i <= 8; i++) {
      allCards.push([aSpecies, i as rank]);
    }
    const handScore = state.hand
      .filter((card) => card[0] === aSpecies)
      .reduce((acc, card) => acc + card[1], 0);
    const score = scorePlayArea(state.playArea, aSpecies);
    const opponentHandScore = state.opponentHand
      .filter((card) => card !== null)
      .filter((card) => card[0] === aSpecies)
      .reduce((acc, card) => acc + card[1], 0);
    const opponentScore = scorePlayArea(state.playArea, aSpecies);
    const remainingScore = allCards
      .filter((card) => {
        state.hand.every(
          (handCard) => handCard[0] !== card[0] && handCard[1] !== card[1],
        );
      })
      .filter((card) => {
        state.opponentHand
          .filter((card) => card !== null)
          .every(
            (handCard) => handCard[0] !== card[0] && handCard[1] !== card[1],
          );
      })
      .reduce((acc, card) => acc + card[1], 0);
    stats[aSpecies] = [
      handScore,
      opponentHandScore,
      remainingScore,
      score[0],
      opponentScore[0],
    ];
  }
  return stats;
}

export function probabilityScoreSpecies(
  hand: Hand,
  opponentHand: opponentHand,
  discard: Discard,
  opponentDiscard: Discard,
  playArea: playArea,
  opponentPlayArea: playArea,
  species: species,
  ignoreCards: Hand = [],
) {
  // console.error({ hand, opponentHand, discard, opponentDiscard });
  const allCards = new Set<string>();
  for (let rank = 1; rank <= 8; rank++) {
    allCards.add(species + rank);
  }
  ignoreCards.forEach((card) => {
    if (card[0] === species) {
      allCards.delete(cardString(card));
    }
  });
  const playAreaCards = getCardsFromPlayArea(playArea);
  playAreaCards.forEach((card) => {
    if (card[0] === species) {
      allCards.delete(cardString(card));
    }
  });
  const opponentPlayAreaCards = getCardsFromPlayArea(opponentPlayArea);
  opponentPlayAreaCards.forEach((card) => {
    if (card[0] === species) {
      allCards.delete(cardString(card));
    }
  });
  hand.forEach((card) => {
    if (card[0] === species) {
      allCards.delete(cardString(card));
    }
  });
  opponentHand.forEach((card) => {
    if (card === null) {
      return;
    }
    if (card[0] === species) {
      allCards.delete(cardString(card));
    }
  });
  const oneCard = species + 1;
  const eightCard = species + 8;

  const stringHand = new Set<string>();
  hand
    .filter((card) => card[0] === species)
    .forEach((card) => stringHand.add(cardString(card)));
  const opponentStringHand = new Set<string>();
  opponentHand
    .filter((card) => {
      if (card === null) {
        return false;
      }
      return card[0] === species;
    })
    .forEach((card) => {
      if (card === null) {
        return null;
      }
      opponentStringHand.add(cardString(card));
    });
  // console.error({ stringHand, opponentStringHand });

  // how many of the cards do they need to beat your score?
  let cardsRemaining = [];
  for (let card of allCards.values()) {
    cardsRemaining.push(card);
  }
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let attempts = 0;
  for (let i = 0; i < cardsRemaining.length ** 2; i++) {
    attempts++;
    let binary = i?.toString(2);
    binary = binary.padStart(cardsRemaining.length, "0");
    // console.error(cardsRemaining);
    // console.error({ binary });
    let tempHand = new Set(stringHand);
    let tempOpponentHand = new Set(opponentStringHand);
    for (let j = 0; j < cardsRemaining.length; j++) {
      const bit = binary[j];
      // console.error(bit);
      // console.error("Target card", cardsRemaining[j]);
      if (bit === "1") {
        tempHand.add(cardsRemaining[j] as string);
      } else {
        tempOpponentHand.add(cardsRemaining[j] as string);
      }
    }
    if (tempOpponentHand.has(oneCard)) {
      tempHand.delete(eightCard);
    }
    if (tempHand.has(oneCard)) {
      tempOpponentHand.delete(eightCard);
    }
    let score = 0;
    for (let card of tempHand) {
      score += Number(card[1]);
    }
    let opposingScore = 0;
    for (let card of tempOpponentHand) {
      opposingScore += Number(card[1]);
    }
    // console.error({ tempHand, tempOpponentHand, score, opposingScore });
    if (opposingScore < score) {
      wins++;
    } else if (score < opposingScore) {
      losses++;
    } else {
      draws++;
    }
  }
  // console.error({ wins, attempts, prob: wins / attempts });
  return [wins / attempts, draws / attempts, losses / attempts];
}
