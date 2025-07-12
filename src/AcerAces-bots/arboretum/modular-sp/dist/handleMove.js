import { subTurn } from './types.js';
import { activeStrategies, adaptStrategies } from './strategies.js';
export function handleMove(state) {
    // Adapt strategies based on game state (optional)
    // adaptStrategies(state);
    switch (state.subTurn) {
        case subTurn.FirstDraw:
        case subTurn.SecondDraw:
            return activeStrategies.draw(state);
        case subTurn.Play:
            return activeStrategies.play(state);
        case subTurn.Discard:
            return activeStrategies.discard(state);
        default:
            throw new Error(`Unknown subturn: ${state.subTurn}`);
    }
}
//# sourceMappingURL=handleMove.js.map