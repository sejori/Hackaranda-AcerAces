export function defaultBotDetail(botNumber: number) {
	return {
		dockerId: 'arboretum-random-bot',
		identifier: 'Random bot ' + (botNumber + 1),
	};
}
