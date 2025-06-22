import {cardString} from './cardString.js';

export function scorePlayArea(playArea, species) {
	let highestScore = 0;
	let bestPaths = [];
	const cardsOfSpecies = getAllCardsOfSpecies(playArea, species);
	for (let [_, coord] of cardsOfSpecies) {
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

function scorePath(path, species) {
	if (path.length === 1) {
		return 0;
	}
	const firstCard = path[0];
	const lastCard = path[path.length - 1];
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

function getScoreFromStartingCard(playArea, startCardCoord, species) {
	let searchTrackStack = [
		{path: [], coord: startCardCoord, visitedCards: new Set()},
	];
	let highestScore = 0;
	let bestPath = [];
	while (searchTrackStack.length) {
		const {path, coord, visitedCards} = searchTrackStack.pop();
		const [x, y] = coord;
		const card = playArea[x]?.[y];
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
		let coordOptions = [
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

function getAllCardsOfSpecies(playArea, species) {
	let coordStack = [[0, 0]];
	const startCard = cardString(playArea[0]?.[0]);
	let visitedCards = new Set();
	visitedCards.add(startCard);
	let cardsOfSpecies = [];
	while (coordStack.length) {
		const [x, y] = coordStack.pop();
		const card = playArea[x]?.[y];
		if (card === undefined) {
			continue;
		}
		if (card[0] === species) {
			cardsOfSpecies.push([card, [x, y]]);
		}

		// Decide which cards to visit
		let coordOptions = [
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
