import { describe, expect, test } from "vitest";
import { playArea } from "../../../../src/games/arboretum/types";
import { compareSpeciesInPlayArea } from "../../../../src/games/arboretum/endgame/compareSpecies";

describe("compareSpeciesInPlayArea", () => {
  test("Returns 0 if player A has more species in play area", () => {
    const playAreaA: playArea = {
      0: { 0: ["W", 8] },
      1: { 0: ["W", 7], 1: ["J", 5], 2: ["J", 4], 3: ["J", 1] },
      2: {
        0: ["R", 7],
        1: ["J", 6],
        2: ["O", 3],
        3: ["R", 2],
        4: ["R", 1],
      },
      3: { 1: ["O", 7], 2: ["M", 1], 3: ["W", 1] },
    };
    const playAreaB: playArea = {
      0: { 0: ["M", 4], 1: ["J", 1], 2: ["O", 2], 3: ["O", 4] },
      1: {
        0: ["M", 3],
        1: ["O", 5],
        2: ["J", 4],
        3: ["R", 6],
        4: ["J", 8],
      },
      2: {
        0: ["O", 1],
        1: ["O", 3],
        2: ["R", 7],
        3: ["O", 8],
      },
    };
    expect(compareSpeciesInPlayArea(playAreaA, playAreaB)).toEqual(0);
  });
  test("Returns 1 if player B has more species in play area", () => {
    const playAreaB: playArea = {
      0: { 0: ["W", 8] },
      1: { 0: ["W", 7], 1: ["J", 5], 2: ["J", 4], 3: ["J", 1] },
      2: {
        0: ["R", 7],
        1: ["J", 6],
        2: ["O", 3],
        3: ["R", 2],
        4: ["R", 1],
      },
      3: { 1: ["O", 7], 2: ["M", 1], 3: ["W", 1] },
    };
    const playAreaA: playArea = {
      0: { 0: ["M", 4], 1: ["J", 1], 2: ["O", 2], 3: ["O", 4] },
      1: {
        0: ["M", 3],
        1: ["O", 5],
        2: ["J", 4],
        3: ["R", 6],
        4: ["J", 8],
      },
      2: {
        0: ["O", 1],
        1: ["O", 3],
        2: ["R", 7],
        3: ["O", 8],
      },
    };
    expect(compareSpeciesInPlayArea(playAreaA, playAreaB)).toEqual(1);
  });
  test("Returns 2 if player A has the same species in play area as player B", () => {
    const playAreaB: playArea = {
      0: { 0: ["W", 8] },
      1: { 0: ["W", 7], 1: ["J", 5], 2: ["J", 4], 3: ["J", 1] },
      2: {
        0: ["R", 7],
        1: ["J", 6],
        2: ["O", 3],
        3: ["R", 2],
        4: ["R", 1],
      },
      3: { 1: ["O", 7], 2: ["O", 1], 3: ["W", 1] },
    };
    const playAreaA: playArea = {
      0: { 0: ["M", 4], 1: ["J", 1], 2: ["O", 2], 3: ["O", 4] },
      1: {
        0: ["M", 3],
        1: ["O", 5],
        2: ["J", 4],
        3: ["R", 6],
        4: ["J", 8],
      },
      2: {
        0: ["O", 1],
        1: ["O", 3],
        2: ["R", 7],
        3: ["O", 8],
      },
    };
    expect(compareSpeciesInPlayArea(playAreaA, playAreaB)).toEqual(2);
  });
});
