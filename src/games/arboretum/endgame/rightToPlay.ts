import type { Hand, species } from "../types.js";

export function getRightToPlay(hands: Hand[], targetSpecies: species) {
  let has8 = -1;
  let has1 = -1;
  const scores = [];
  for (let i = 0; i < hands.length; i++) {
    const hand = hands[i] as Hand;
    const score = hand.reduce((acc, card) => {
      const [species, rank] = card;
      if (species == targetSpecies) {
        if (rank === 8) {
          has8 = i;
        } else if (rank === 1) {
          has1 = i;
        }
        return acc + rank;
      }
      return acc;
    }, 0);
    scores.push(score);
  }

  if (has1 !== -1 && has1 !== has8) {
    scores[has8] = (scores[has8] as number) - 8;
  }

  let winners: number[] = [];
  let highestScore = 0;
  for (let i = 0; i < scores.length; i++) {
    const score = scores[i] as number;
    if (score > highestScore) {
      highestScore = score;
      winners = [i];
    } else if (score == highestScore) {
      winners.push(i);
    }
  }

  return winners;
}
