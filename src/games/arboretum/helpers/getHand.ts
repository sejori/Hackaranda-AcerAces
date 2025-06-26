import type {gameState} from '../types.js';

export function getCurrentHand(state: gameState) {
	return state.currentPlayer === 0 ? state.handA : state.handB;
}

export function getOpponentHand(state: gameState) {
	return state.currentPlayer === 1 ? state.handA : state.handB;
}
