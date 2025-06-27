import { vi } from "vitest";
import { gameInterface } from "../src/games/types";

export function getMockGameInterface(turns: number) {
  const mockGameInterface: gameInterface<any, any, any, any, any, any> = {
    getInitialGameState: vi
      .fn()
      .mockReturnValue({ turn: 0, currentPlayer: 0, opponent: "", moves: [] }),
    players: 2,
    gameOver: vi.fn((state) => {
      return state.turn >= turns;
    }),
    isValidMove: vi.fn((state, move) => {
      return move !== "invalid Move";
    }),
    applyMove: vi.fn((state, move) => {
      state.moves.push(move);
      state.currentPlayer = (state.currentPlayer + 1) % 2;
      state.turn++;
      return state;
    }),
    getRandomMove: vi.fn().mockReturnValue("randomMove"),
    getActivePlayerState: vi.fn((state) => {
      return {
        activeTurn: true,
        previousTurn: { move: false },
        showPreviousTurn: false,
        turn: state.turn,
      };
    }),
    getInactivePlayerState: vi.fn((state) => {
      return {
        activeTurn: true,
        previousTurn: { move: false },
        showPreviousTurn: false,
        turn: state.turn,
      };
    }),
    newGameMessage: vi.fn((gameNumber: number, round: string) => {
      return { gameNumber, round, message: "NEWGAME" as const };
    }),
    postGameMessage: vi.fn((result, scores, finalState) => {
      return {
        message: "ENDGAME" as const,
        result,
        score: scores[0],
        opponentScore: scores[1],
        finalState,
      };
    }),
    getWinner: vi.fn((state) => {
      return {
        result: 0 as const,
        metaData: false,
        scoreA: 0,
        scoreB: 0,
      };
    }),
    displayForUser: vi.fn(),
    showPreviousTurn: vi.fn(),
    userMoveMessage: vi.fn(),
    userMoveTranslate: vi.fn(),
    playerMoveValidator: vi.fn(),
    showScore: vi.fn(),
    defaultBotDetail: vi.fn(),
  };
  return mockGameInterface;
}
