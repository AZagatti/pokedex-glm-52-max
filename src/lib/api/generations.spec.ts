/**
 * Unit tests for generation helpers.
 */

import { describe, it, expect } from "vitest";

import {
  generations,
  GENERATION_RANGES,
  GENERATION_LABELS,
  idToGeneration,
  generationRange,
} from "./generations";

describe("generations", () => {
  describe("GENERATION_RANGES", () => {
    it("has ranges for all 9 generations", () => {
      expect(Object.keys(GENERATION_RANGES)).toHaveLength(9);
    });

    it("ranges are contiguous and non-overlapping", () => {
      const ranges = Object.values(GENERATION_RANGES).toSorted(
        (a, b) => a[0] - b[0]
      );
      for (let i = 1; i < ranges.length; i++) {
        expect(ranges[i][0]).toBe(ranges[i - 1][1] + 1);
      }
    });

    it("Gen I starts at 1 and ends at 151", () => {
      expect(GENERATION_RANGES[1]).toEqual([1, 151]);
    });
  });

  describe("GENERATION_LABELS", () => {
    it("has labels for all 9 generations", () => {
      for (const gen of generations) {
        expect(GENERATION_LABELS[gen]).toBeTruthy();
        expect(GENERATION_LABELS[gen]).toContain("Gen");
      }
    });
  });

  describe("idToGeneration", () => {
    it("maps Bulbasaur (#1) to Gen I", () => {
      expect(idToGeneration(1)).toBe(1);
    });

    it("maps Mew (#151) to Gen I", () => {
      expect(idToGeneration(151)).toBe(1);
    });

    it("maps Chikorita (#152) to Gen II", () => {
      expect(idToGeneration(152)).toBe(2);
    });

    it("returns null for IDs beyond known ranges", () => {
      expect(idToGeneration(9999)).toBeNull();
    });
  });

  describe("generationRange", () => {
    it("returns the range for a valid generation", () => {
      expect(generationRange(3)).toEqual([252, 386]);
    });

    it("returns null for an invalid generation", () => {
      expect(generationRange(99)).toBeNull();
    });
  });
});
