/**
 * Unit tests for the in-memory cache module.
 */

import { describe, it, expect, beforeEach } from "vitest";

import {
  getCached,
  setCached,
  getInflight,
  setInflight,
  invalidate,
  clearCache,
} from "./cache";

describe("cache", () => {
  beforeEach(() => {
    clearCache();
  });

  describe("getCached / setCached", () => {
    it("returns undefined for uncached URLs", () => {
      expect(getCached("https://example.com/uncached")).toBeUndefined();
    });

    it("stores and retrieves values", () => {
      const url = "https://example.com/data";
      setCached(url, { name: "bulbasaur" });
      expect(getCached(url)).toEqual({ name: "bulbasaur" });
    });

    it("expires entries after the TTL", async () => {
      const url = "https://example.com/ephemeral";
      setCached(url, "temp", 50); // 50ms TTL
      expect(getCached(url)).toBe("temp");

      await new Promise((r) => setTimeout(r, 60));
      expect(getCached(url)).toBeUndefined();
    });
  });

  describe("invalidate", () => {
    it("removes a specific entry", () => {
      setCached("https://a.com", "a");
      setCached("https://b.com", "b");
      invalidate("https://a.com");
      expect(getCached("https://a.com")).toBeUndefined();
      expect(getCached("https://b.com")).toBe("b");
    });
  });

  describe("setInflight / getInflight", () => {
    it("deduplicates concurrent requests for the same URL", async () => {
      let resolvePromise: (v: string) => void;
      const sharedPromise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });

      setInflight("https://example.com/dedupe", sharedPromise);

      // Both callers get the same promise.
      const p1 = getInflight("https://example.com/dedupe");
      const p2 = getInflight("https://example.com/dedupe");
      expect(p1).toBe(p2);

      resolvePromise!("result");
      await sharedPromise;
      // Allow the .finally() cleanup microtask to run.
      await new Promise((r) => setTimeout(r, 0));

      // After resolution, the inflight entry is cleared.
      expect(getInflight("https://example.com/dedupe")).toBeUndefined();
    });

    it("clears inflight entries even when the promise rejects", async () => {
      const url = "https://example.com/fail";
      const failingPromise = setInflight(
        url,
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("fail")), 10)
        )
      );

      await expect(failingPromise).rejects.toThrow("fail");
      // Allow the .finally() cleanup microtask to run.
      await new Promise((r) => setTimeout(r, 0));

      // Inflight entry should be cleaned up despite the rejection.
      expect(getInflight(url)).toBeUndefined();
    });
  });
});
