function pickLowestCardFromHand(hand) {
	let lowestCard = hand[0];
	for (let card of hand) {
		if (card[1] < lowestCard[1]) {
			lowestCard = card;
		}
	}
	return lowestCard;
}

function pickRarestCardFromHand(hand) {
	let rarestSpecies;
	let rarestSpeciesCount = Infinity;
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
		if (currentCount < rarestSpeciesCount) {
			rarestSpecies = species;
			rarestSpeciesCount = currentCount;
		}
	}
	return pickLowestCardFromHand(hand.filter(card => card[0] == rarestSpecies));
}

function pickRandomCardFromHand(hand) {
	const randomIndex = Math.floor(Math.random() * hand.length);
	return hand[randomIndex];
}

export function discardMove(state) {
	return pickRandomCardFromHand(state.hand);
}
