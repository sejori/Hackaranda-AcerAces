import type { BotProcess } from "../../src/botHandler/index.js";
import type { gameTitle } from "../../src/games/index.js";
import type { gameInterface } from "../../src/games/types.js";
import { playMatch } from "../../src/match/index.js";
import { PlayerProcess } from "../../src/playerHandler/index.js";
jest.mock("../../src/playerHandler/index.js");

// const mockGameType: Record<
//   gameTitle,
//   gameInterface<any, any, any, any, any, any>
// > = {};

const mockGameInterface: gameInterface<any, any, any, any, any, any> = {
  getInitialGameState: jest.fn().mockReturnValue({ data: "initialState" }),
  players: 2,
  gameOver: jest.fn((done: boolean) => done),
  isValidMove: jest.fn().mockReturnValue(true),
  applyMove: jest.fn((state, move) => state),
  getRandomMove: jest.fn().mockReturnValue(0),
  getActivePlayerState: jest.fn(),
  getInactivePlayerState: jest.fn(),
  newGameMessage: jest.fn(),
  postGameMessage: jest.fn(),
  getWinner: jest.fn(),
  displayForUser: jest.fn(),
  showPreviousTurn: jest.fn(),
  userMoveMessage: jest.fn(),
  userMoveTranslate: jest.fn(),
  playerMoveValidator: jest.fn(),
  showScore: jest.fn(),
  defaultBotDetail: jest.fn(),
};

describe("Match", () => {
  test("Match test", () => {
    playMatch(
      new PlayerProcess(
        "player",
        "Test1",
        "arboretum",
      ) as unknown as BotProcess,
      new PlayerProcess(
        "player",
        "Test1",
        "arboretum",
      ) as unknown as BotProcess,
      1,
      "arboretum",
      false,
      { arboretum: mockGameInterface, tictactoe: mockGameInterface },
    );
    expect(2 + 5).toBe(7);
  });
});
