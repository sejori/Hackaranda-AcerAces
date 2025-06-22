import {cardString} from '../helpers/cardString.js';
import type {Card, coord, path, playArea, species} from '../types.js';

export function scorePlayArea(playArea: playArea, species: species) {
	let highestScore = 0;
	let bestPaths: path[] = [];
	const cardsOfSpecies = getAllCardsOfSpecies(playArea, species);
	for (let [card, coord] of cardsOfSpecies) {
		let [score, path] = getScoreFromStartingCard(playArea, coord, species);
		if (score > highestScore) {
			bestPaths = [...path];
			highestScore = score;
		} else if (score == highestScore) {
			bestPaths.push(...path);
		}
	}
	return [highestScore, bestPaths];
}

function scorePath(path: path, species: species) {
	if (path.length === 1) {
		return 0;
	}
	const firstCard = path[0] as Card;
	const lastCard = path[path.length - 1] as Card;
	if (firstCard[0] !== species || lastCard[0] !== species) {
		return 0;
	}
	let score = path.length;
	const sameSpecies = path.every(card => card[0] == species);
	const pathLength = path.length;

	if (sameSpecies && pathLength >= 4) {
		score += path.length;
	}

	if (firstCard[1] === 1) {
		score += 1;
	}

	if (lastCard[1] === 8) {
		score += 2;
	}

	return score;
}

type searchTrack = {
	path: Card[];
	coord: coord;
	visitedCards: Set<string>;
};
function getScoreFromStartingCard(
	playArea: playArea,
	startCardCoord: coord,
	species: species,
): [number, path[]] {
	let searchTrackStack: searchTrack[] = [
		{path: [], coord: startCardCoord, visitedCards: new Set()},
	];
	let highestScore = 0;
	let bestPath: path[] = [];
	while (searchTrackStack.length) {
		const {path, coord, visitedCards} = searchTrackStack.pop() as searchTrack;
		const [x, y] = coord;
		const card = playArea[x]?.[y] as Card;
		visitedCards.add(cardString(card));
		path.push(card);

		// Check score
		const score = scorePath(path, species);
		if (score > highestScore) {
			highestScore = score;
			bestPath = [path];
		} else if (score == highestScore) {
			bestPath.push(path);
		}

		// Decide which cards to visit
		let coordOptions: coord[] = [
			[x, y + 1],
			[x, y - 1],
			[x + 1, y],
			[x - 1, y],
		];
		for (let [x, y] of coordOptions) {
			const nextCard = playArea[x]?.[y];
			if (nextCard === undefined || visitedCards.has(cardString(nextCard))) {
				continue;
			}
			if (nextCard[1] <= card[1]) {
				continue;
			}
			searchTrackStack.push({
				path: [...path],
				coord: [x, y],
				visitedCards: new Set(visitedCards),
			});
		}
	}
	return [highestScore, bestPath];
}

function getAllCardsOfSpecies(playArea: playArea, species: species) {
	let coordStack: coord[] = [[0, 0]];
	const startCard = cardString(playArea[0]?.[0] as Card);
	let visitedCards: Set<string> = new Set();
	visitedCards.add(startCard);
	let cardsOfSpecies: [Card, coord][] = [];
	while (coordStack.length) {
		const [x, y] = coordStack.pop() as coord;
		const card = playArea[x]?.[y] as Card;
		if (card[0] === species) {
			cardsOfSpecies.push([card, [x, y]]);
		}

		// Decide which cards to visit
		let coordOptions: coord[] = [
			[x, y + 1],
			[x, y - 1],
			[x + 1, y],
			[x - 1, y],
		];
		for (let [x, y] of coordOptions) {
			const card = playArea[x]?.[y];
			if (card === undefined || visitedCards.has(cardString(card))) {
				continue;
			}
			coordStack.push([x, y]);
			visitedCards.add(cardString(card));
		}
	}
	return cardsOfSpecies;
}

// let playArea: playArea = {
//   0: { 0: ["J", 8], 1: ["O", 6], "-1": ["C", 3] },
//   1: { 0: ["R", 2], 1: ["O", 5] },
//   2: { 0: ["J", 3], 1: ["O", 4], "-1": ["R", 6] },
//   3: { 0: ["W", 1], 1: ["O", 1] },
// };
//
// console.log("J:");
// const j = scorePlayArea(playArea, "J");
// console.log(j[0], j[1]);
// console.log("O:");
// const r = scorePlayArea(playArea, "O");
// console.log(r[0], r[1]);
// console.log("R:");
// const m = scorePlayArea(playArea, "R");
// console.log(m[0], m[1]);
