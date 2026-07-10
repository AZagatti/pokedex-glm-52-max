/**
 * Unit tests for the type colors + helpers.
 */

import { describe, it, expect } from "vitest";

import { TYPE_COLORS, ALL_TYPES, getTypeInfo, typeGradient } from "./types";

describe("types", () => {
  describe("TYPE_COLORS", () => {
    it("contains all 18 Pokémon types", () => {
      expect(Object.keys(TYPE_COLORS)).toHaveLength(18);
    });

    it("each type has color, tint, and icon", () => {
      for (const [, info] of Object.entries(TYPE_COLORS)) {
        expect(info.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(info.tint).toMatch(/^#[0-9a-f]{6}$/i);
        expect(typeof info.icon).toBe("string");
        expect(info.icon.length).toBeGreaterThan(0);
      }
    });
  });

  describe("ALL_TYPES", () => {
    it("is sorted alphabetically", () => {
      const sorted = [...ALL_TYPES].toSorted();
      expect(ALL_TYPES).toEqual(sorted);
    });

    it("has 18 types", () => {
      expect(ALL_TYPES).toHaveLength(18);
    });
  });

  describe("getTypeInfo", () => {
    it("returns info for known types", () => {
      const fire = getTypeInfo("fire");
      expect(fire.color).toBe("#ff9d55");
    });

    it("falls back to normal for unknown types", () => {
      const unknown = getTypeInfo("nonexistent");
      expect(unknown).toBe(TYPE_COLORS.normal);
    });

    it("is case-insensitive", () => {
      expect(getTypeInfo("FIRE")).toEqual(getTypeInfo("fire"));
    });
  });

  describe("typeGradient", () => {
    it("generates a linear gradient string", () => {
      const gradient = typeGradient(["fire"]);
      expect(gradient).toContain("linear-gradient");
      expect(gradient).toContain("#ff9d55");
    });

    it("blends two type colors for dual types", () => {
      const gradient = typeGradient(["fire", "water"]);
      expect(gradient).toContain("#ff9d55");
      expect(gradient).toContain("#5090d6");
    });

    it("falls back to normal for empty types", () => {
      const gradient = typeGradient([]);
      expect(gradient).toContain("#9099a1"); // normal color
    });
  });
});
