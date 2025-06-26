import type {Card} from '../types.js';

export function cardString(card: Card) {
	return card[0] + card[1];
}

export function cardArr(card: string) {
	return [card[0], Number(card[1])] as unknown as Card;
}
