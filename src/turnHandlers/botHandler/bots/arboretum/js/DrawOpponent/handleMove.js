import {discardMove} from './discard.js';
import { drawMove } from './draw.js';
import {randomPlayMove} from './play.js';

export function handleMove(state) {
	switch (state.subTurn) {
		case 0:
		case 1:
			return drawMove(state);
		case 2:
			return randomPlayMove(state);
		case 3:
			return discardMove(state);
	}
}

function randomDrawMove(state) {
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
