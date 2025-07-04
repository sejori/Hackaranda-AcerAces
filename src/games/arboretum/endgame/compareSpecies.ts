import { getCardsFromPlayArea } from "../helpers/getCardsFromPlayArea.js";
import type { Hand, playArea, species } from "../types.js";

export function compareSpeciesInPlayArea(
  playAreaA: playArea,
  playAreaB: playArea,
) {
  const speciesCountA = speciesInHand(getCardsFromPlayArea(playAreaA));
  const speciesCountB = speciesInHand(getCardsFromPlayArea(playAreaB));
  if (speciesCountA > speciesCountB) {
    return 0;
  } else if (speciesCountB > speciesCountA) {
    return 1;
  }
  return 2;
}

function speciesInHand(hand: Hand) {
  const speciesSet = new Set<species>();
  let count = 0;
  for (let card of hand) {
    const [aSpecies, rank] = card;
    if (!speciesSet.has(aSpecies)) {
      speciesSet.add(aSpecies);
      count++;
    }
  }
  return count;
}
