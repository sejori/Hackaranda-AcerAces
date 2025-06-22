export function drawMove(state) {
  const mostCommonSpecies = getMostCommonSpeciesFromHand(state.hand);
  // console.error({mostCommonSpecies, hand: state.hand});
  if (state.discard.length > 0 && state.discard[0][0] === mostCommonSpecies) {
    return 1;
  }
  if (state.opponentDiscard.length > 0 && state.opponentDiscard[0][0] === mostCommonSpecies) {
    return 2;
  }
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


function getMostCommonSpeciesFromHand(hand) {
	let mostCommonSpecies;
	let mostCommonSpeciesCount = -Infinity;
	const countBySpecies = {};

	for (let card of hand) {
		const [species, _] = card;
		let currentCount = countBySpecies[species];
		if (currentCount == undefined) {
			countBySpecies[species] = 1;
		} else {
			countBySpecies[species] += 1;
		}
		currentCount = countBySpecies[species];
		if (currentCount > mostCommonSpeciesCount) {
			mostCommonSpecies = species;
			mostCommonSpeciesCount = currentCount;
		}
	}
	return mostCommonSpecies;
}
