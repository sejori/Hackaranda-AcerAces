import { describe, expect, test } from "vitest";
import { Hand, species } from "../../../../src/games/arboretum/types";
import { getRightToPlay } from "../../../../src/games/arboretum/endgame/rightToPlay";

describe("getRightToPlay", () => {
  test("Compares sum of species in each hand and returns winner", () => {
    const handA: Hand = [
      ["J", 3],
      ["W", 4],
      ["J", 2],
      ["C", 3],
      ["C", 8],
      ["O", 8],
      ["O", 3],
    ];
    const handB: Hand = [
      ["J", 5],
      ["J", 6],
      ["J", 7],
      ["C", 5],
      ["M", 6],
      ["R", 2],
      ["O", 2],
    ];
    const expectedWinners: Record<species, number[]> = {
      J: [1],
      R: [1],
      C: [0],
      M: [1],
      O: [0],
      W: [0],
    };

    for (let aSpecies of species) {
      const winners = getRightToPlay([handA, handB], aSpecies);
      expect(winners).toEqual(expectedWinners[aSpecies]);
    }
  });
  test("Returns both as winners if equal", () => {
    const handA: Hand = [
      ["J", 3],
      ["J", 8],
      ["J", 2],
      ["C", 3],
      ["C", 8],
      ["O", 8],
      ["O", 3],
    ];
    const handB: Hand = [
      ["J", 6],
      ["J", 7],
      ["C", 5],
      ["M", 6],
      ["R", 2],
      ["O", 2],
      ["C", 6],
    ];
    const expectedWinners: Record<species, number[]> = {
      J: [0, 1],
      R: [1],
      C: [0, 1],
      M: [1],
      O: [0],
      W: [0, 1],
    };

    for (let aSpecies of species) {
      const winners = getRightToPlay([handA, handB], aSpecies);
      expect(winners).toEqual(expectedWinners[aSpecies]);
    }
  });
  test("1 cancels out 8 only in opposing hands", () => {
    const handA: Hand = [
      ["J", 3],
      ["J", 8],
      ["J", 2],
      ["C", 3],
      ["C", 8],
      ["O", 8],
      ["O", 1],
    ];
    const handB: Hand = [
      ["J", 6],
      ["J", 7],
      ["J", 1],
      ["C", 5],
      ["M", 6],
      ["O", 2],
      ["C", 6],
    ];
    const expectedWinners: Record<species, number[]> = {
      J: [1],
      R: [0, 1],
      C: [0, 1],
      M: [1],
      O: [0],
      W: [0, 1],
    };

    for (let aSpecies of species) {
      const winners = getRightToPlay([handA, handB], aSpecies);
      expect(winners).toEqual(expectedWinners[aSpecies]);
    }
  });
});
