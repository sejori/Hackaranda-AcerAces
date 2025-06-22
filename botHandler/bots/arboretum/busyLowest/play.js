import {scorePlayArea} from './helpers/scoring.js';
import {cardString} from './helpers/cardString.js';

export function playMove(state) {
	let highestScore = -Infinity;
	let bestCard = state.hand[0];
	let bestCoord = [0, 0];
	if (state.playArea[0]?.[0] === undefined) {
		return {card: bestCard, coord: bestCoord};
	}
	const species = ['J', 'R', 'C', 'M', 'O', 'W'];
	const coords = getAllEmptySpaces(state.playArea);
	bestCoord = coords[0];
	for (let card of state.hand) {
		for (let coord of coords) {
			const newPlayArea = placeCardInPlayArea(
				state.playArea,
				card,
				coord[0],
				coord[1],
			);
			let score = 0;
			for (let aSpecies of species) {
				const [speciesScore, _] = scorePlayArea(newPlayArea, aSpecies);
				score += speciesScore;
			}
			if (score > highestScore) {
				highestScore = score;
				bestCard = card;
				bestCoord = coord;
			}
		}
	}
	return {card: bestCard, coord: bestCoord};
}

function placeCardInPlayArea(playArea, newCard, newX, newY) {
	const newPlayArea = {};
	for (let x of Object.keys(playArea)) {
		const row = playArea[x];
		for (let y of Object.keys(row)) {
			const card = row[y];
			playAreaInsert(newPlayArea, card, x, y);
		}
	}
	playAreaInsert(newPlayArea, newCard, newX, newY);
	return newPlayArea;
}

function playAreaInsert(playArea, card, x, y) {
	const row = playArea[x];
	if (row == undefined) {
		playArea[x] = {};
	}
	playArea[x][y] = card;
}

function getAllEmptySpaces(playArea) {
	const toView = [[0, 0]];
	const visitedCards = new Set();
	const emptySpaces = [];
	while (toView.length) {
		const [x, y] = toView.pop();
		let card = playArea[x]?.[y];
		if (card === undefined) return [x, y];
		visitedCards.add(cardString(card));

		let coordOptions = [
			[x, y + 1],
			[x, y - 1],
			[x + 1, y],
			[x - 1, y],
		];
		for (let [x, y] of coordOptions) {
			const card = playArea[x]?.[y];
			if (card === undefined) {
				emptySpaces.push([x, y]);
				continue;
			}
			if (visitedCards.has(cardString(card))) {
				continue;
			}
			toView.push([x, y]);
		}
	}
	return emptySpaces;
}
