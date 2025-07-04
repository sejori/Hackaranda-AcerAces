import { describe, expect, test } from "vitest";
import { playArea, species } from "../../../../src/games/arboretum/types";
import { scorePlayArea } from "../../../../src/games/arboretum/endgame/scoring";

// export type species = "J" | "R" | "C" | "M" | "O" | "W";
describe("scorePlayArea", () => {
  test("correct scoring for rules play area", () => {
    const defaultPlayArea: playArea = {
      [-1]: { [-1]: ["W", 3], 0: ["J", 8], 1: ["O", 6] },
      0: { 0: ["C", 2], 1: ["O", 5] },
      1: { [-1]: ["C", 6], 0: ["J", 3], 1: ["O", 4] },
      2: { 0: ["R", 6], 1: ["O", 1] },
    };

    const expectedScores: Record<species, number> = {
      W: 0,
      J: 7,
      R: 0,
      C: 3,
      M: 0,
      O: 9,
    };

    for (let aSpecies of species) {
      const score = scorePlayArea(defaultPlayArea, aSpecies);
      expect(score[0]).toBe(expectedScores[aSpecies]);
    }
  });

  test("correct scoring for rainbow staircase play area", () => {
    const defaultPlayArea: playArea = {
      0: { 0: ["O", 8] },
      1: { [-1]: ["R", 8], 0: ["W", 7], 1: ["J", 8] },
      2: { [-2]: ["W", 4], [-1]: ["R", 5], 0: ["M", 6] },
      3: { [-2]: ["J", 3], [-1]: ["M", 4] },
      4: { [-3]: ["R", 1], [-2]: ["W", 2], [-1]: ["O", 5] },
      5: { [-2]: ["W", 1] },
    };

    const expectedScores: Record<species, number> = {
      W: 8,
      J: 8,
      R: 11,
      C: 0,
      M: 3,
      O: 0,
    };

    for (let aSpecies of species) {
      const score = scorePlayArea(defaultPlayArea, aSpecies);
      expect(score[0]).toBe(expectedScores[aSpecies]);
    }
  });

  test("correct scoring for terminal-style play area", () => {
    const defaultPlayArea: playArea = {
      3: { 3: ["C", 1], 4: ["C", 8] },
      2: { 2: ["J", 1], 3: ["C", 2], 4: ["C", 7], 5: ["J", 8] },
      1: {
        1: ["R", 1],
        2: ["J", 2],
        3: ["C", 3],
        4: ["C", 6],
        5: ["J", 7],
        6: ["R", 8],
      },
      0: {
        0: ["O", 1],
        1: ["O", 2],
        2: ["O", 3],
        3: ["O", 4],
        4: ["O", 5],
        5: ["O", 6],
        6: ["O", 7],
        7: ["O", 8],
      },
      [-1]: { 1: ["W", 1], 2: ["M", 2], 5: ["M", 7], 6: ["W", 8] },
      [-2]: { 2: ["M", 1], 5: ["M", 8] },
    };

    const expectedScores: Record<species, number> = {
      W: 11,
      J: 11,
      R: 11,
      C: 15,
      M: 11,
      O: 19,
    };

    for (let aSpecies of species) {
      const score = scorePlayArea(defaultPlayArea, aSpecies);
      expect(score[0]).toBe(expectedScores[aSpecies]);
    }
  });

  test("correct scoring for other play areas", () => {
    const playAreas: [playArea, Record<species, number>][] = [
      [
        {
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
        },
        {
          W: 10,
          J: 9,
          R: 8,
          C: 0,
          M: 0,
          O: 7,
        },
      ],
      [
        {
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
        },
        {
          W: 0,
          J: 8,
          R: 0,
          C: 0,
          M: 2,
          O: 7,
        },
      ],
      [
        {
          5: { [-2]: ["C", 8] },
          4: { [-1]: ["W", 6], [-2]: ["C", 7] },
          3: { [-1]: ["R", 5], [-2]: ["C", 6], [-3]: ["J", 7] },
          2: { [-1]: ["C", 4], 0: ["R", 3] },
          1: { [-1]: ["J", 2], 0: ["C", 2], 1: ["R", 1] },
          0: { 0: ["C", 1], [-1]: ["W", 1] },
        },
        {
          W: 6,
          J: 5,
          R: 6,
          C: 11,
          M: 0,
          O: 0,
        },
      ],
      [
        {
          7: { 1: ["C", 7] },
          6: { 1: ["C", 6] },
          5: { 1: ["C", 5] },
          4: { 1: ["C", 3] },
          3: { 0: ["J", 8], 1: ["C", 2] },
          2: { 0: ["O", 7], 1: ["C", 1], 2: ["W", 8] },
          1: { 0: ["J", 3], 1: ["O", 5], 2: ["O", 2], 3: ["O", 1] },
          0: { 0: ["J", 2], 1: ["O", 8], 2: ["W", 1] },
        },
        {
          W: 6,
          J: 6,
          R: 0,
          C: 13,
          M: 0,
          O: 11,
        },
      ],
      [
        {
          2: { 3: ["M", 4] },
          1: { 0: ["J", 1], 1: ["J", 4], 2: ["J", 5], 3: ["J", 6] },
          0: {
            0: ["R", 1],
            1: ["R", 3],
            2: ["R", 4],
            3: ["R", 5],
            4: ["R", 6],
            5: ["R", 7],
            6: ["R", 8],
          },
          [-1]: {
            2: ["W", 3],
            3: ["W", 4],
            4: ["W", 5],
          },
          [-2]: {
            3: ["M", 3],
          },
        },
        {
          W: 3,
          J: 9,
          R: 17,
          C: 0,
          M: 0,
          O: 0,
        },
      ],
      [
        {
          2: { 1: ["C", 8], 2: ["J", 6], 3: ["J", 8] },
          1: {
            0: ["J", 4],
            1: ["C", 3],
            2: ["J", 5],
            3: ["J", 1],
            4: ["J", 7],
          },
          0: {
            0: ["M", 8],
            1: ["M", 5],
            2: ["M", 4],
            3: ["W", 6],
            4: ["W", 4],
          },
          [-1]: { 2: ["M", 1], 3: ["W", 8], 4: ["W", 3] },
        },
        {
          W: 10,
          J: 11,
          R: 0,
          C: 6,
          M: 11,
          O: 0,
        },
      ],
      [
        {
          1: { 1: ["C", 7], 2: ["R", 8], 3: ["O", 8] },
          0: {
            0: ["W", 5],
            1: ["C", 5],
            2: ["R", 6],
            3: ["O", 4],
            4: ["W", 1],
          },
          [-1]: { 1: ["C", 4], 2: ["R", 4], 3: ["O", 2], 4: ["W", 7] },
          [-2]: { 1: ["C", 1], 2: ["R", 2], 3: ["O", 1] },
        },
        {
          W: 3,
          J: 0,
          R: 10,
          C: 9,
          M: 0,
          O: 11,
        },
      ],
    ];
    for (let [playArea, expectedScores] of playAreas) {
      for (let aSpecies of species) {
        const score = scorePlayArea(playArea, aSpecies);
        expect(score[0]).toBe(expectedScores[aSpecies]);
      }
    }
  });
});
