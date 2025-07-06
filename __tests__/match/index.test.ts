import { playMatch } from "../../src/match/index.js";
import { describe, test, expect, vi } from "vitest";
import { getMockGameInterface } from "../mockGameInterface.js";
import { getBotProcessMock } from "../mockBotProcess.js";

describe("Match", () => {
  test("Match lasts the correct number of turns", async () => {
    const firstBot = getBotProcessMock("test", "Test1");
    const secondBot = getBotProcessMock("test", "Test2");

    const turns = [10, 5, 29];
    for (let maxTurns of turns) {
      const gameInterface = getMockGameInterface(maxTurns);

      const result = await playMatch(
        firstBot,
        secondBot,
        1,
        "arboretum",
        false,
        false,
        false,
        {
          arboretum: gameInterface,
          tictactoe: gameInterface,
        },
      );
      expect(result.gameState.moves.length).toBe(maxTurns);
    }
  });

  test("Alternates active player using current player", async () => {
    const firstBot = getBotProcessMock("test", "Test1");
    const secondBot = getBotProcessMock("test", "Test2");
    const turns = 20;
    const swaps = [
      [1, 4, 5, 8],
      [1, 3, 6, 10],
      [8, 10, 15, 18],
    ];
    for (let swap of swaps) {
      const gameInterface = getMockGameInterface(turns);
      gameInterface.applyMove = vi.fn((state, move) => {
        state.moves.push(move);
        state.turn++;
        state.currentPlayer = swap.includes(state.turn)
          ? (state.currentPlayer + 1) % 2
          : state.currentPlayer;
        return state;
      });
      const result = await playMatch(
        firstBot,
        secondBot,
        1,
        "arboretum",
        false,
        false,
        false,
        {
          arboretum: gameInterface,
          tictactoe: gameInterface,
        },
      );
      let prevTurn = 0;
      let currentPlayer = 1;
      for (let turn of swap) {
        currentPlayer = (currentPlayer + 1) % 2;
        for (let i = prevTurn; i < turn; i++) {
          const move = result.gameState.moves[i];
          const targetMove = "Test" + (currentPlayer + 1);
          const antiMove = "Test" + (2 - currentPlayer);
          expect(
            move.includes(targetMove) && !move.includes(antiMove),
          ).toBeTruthy();
        }
        prevTurn = turn;
      }
      currentPlayer = (currentPlayer + 1) % 2;
      for (let i = prevTurn; i < turns; i++) {
        const move = result.gameState.moves[i];
        const targetMove = "Test" + (currentPlayer + 1);
        const antiMove = "Test" + (2 - currentPlayer);
        expect(
          move.includes(targetMove) && !move.includes(antiMove),
        ).toBeTruthy();
      }
    }
  });

  test('Performs random move if bot move is "RANDOM"', async () => {
    const turns = 20;
    const randomMovesTests = [
      [1, 4, 5, 8],
      [1, 3, 6, 10],
      [8, 10, 15, 18],
    ];
    for (let randomMoves of randomMovesTests) {
      const gameInterface = getMockGameInterface(turns);
      gameInterface.getRandomMove = vi
        .fn()
        .mockReturnValue("ExpectedRandomMove");
      const firstBot = getBotProcessMock("test", "Test1");
      firstBot.send = vi.fn(async (gameState: any) => {
        if (randomMoves.includes(gameState.turn)) {
          return "RANDOM";
        }
        return "move from " + firstBot.identifier;
      });
      const secondBot = getBotProcessMock("test", "Test2");
      secondBot.send = vi.fn(async (gameState: any) => {
        if (randomMoves.includes(gameState.turn)) {
          return "RANDOM";
        }
        return "move from " + secondBot.identifier;
      });
      const result = await playMatch(
        firstBot,
        secondBot,
        1,
        "arboretum",
        false,
        false,
        false,
        {
          arboretum: gameInterface,
          tictactoe: gameInterface,
        },
      );
      for (let i = 0; i < turns; i++) {
        const move = result.gameState.moves[i];
        if (randomMoves.includes(i)) {
          expect(move).toBe("ExpectedRandomMove");
        } else {
          expect(move).not.toBe("ExpectedRandomMove");
        }
      }
    }
  });
  test("Performs random move if bot times out", async () => {
    const turns = 20;
    const randomMovesTests = [
      [1, 4, 5, 8],
      [1, 3, 6, 10],
      [8, 10, 15, 18],
    ];
    for (let randomMoves of randomMovesTests) {
      const gameInterface = getMockGameInterface(turns);
      gameInterface.getRandomMove = vi
        .fn()
        .mockReturnValue("ExpectedRandomMove");
      const firstBot = getBotProcessMock("test", "Test1");
      firstBot.send = vi.fn(async (gameState: any) => {
        if (randomMoves.includes(gameState.turn)) {
          return "sendTimeout";
        }
        return "move from " + firstBot.identifier;
      });
      const secondBot = getBotProcessMock("test", "Test2");
      secondBot.send = vi.fn(async (gameState: any) => {
        if (randomMoves.includes(gameState.turn)) {
          return "RANDOM";
        }
        return "move from " + secondBot.identifier;
      });
      const result = await playMatch(
        firstBot,
        secondBot,
        1,
        "arboretum",
        false,
        false,
        false,
        {
          arboretum: gameInterface,
          tictactoe: gameInterface,
        },
      );
      for (let i = 0; i < turns; i++) {
        const move = result.gameState.moves[i];
        if (randomMoves.includes(i)) {
          expect(move).toBe("ExpectedRandomMove");
        } else {
          expect(move).not.toBe("ExpectedRandomMove");
        }
      }
    }
  });
});
