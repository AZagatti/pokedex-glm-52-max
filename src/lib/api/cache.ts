/**
 * Tiny in-memory cache keyed by URL.
 *
 * Per the spec: "a small src/lib/api/cache.ts in-memory cache (Map keyed by URL)".
 * Stores in-flight promises so concurrent callers for the same URL share a single
 * request (deduplication), and resolved responses so repeated navigations are instant.
 */

interface CacheEntry<T> { value: T; expiry: number }

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

const DEFAULT_TTL = 1000 * 60 * 10; // 10 minutes — Pokémon data rarely changes.

/** Get a cached value if present and not expired. */
export function getCached<T>(url: string): T | undefined {
  const entry = store.get(url);
  if (!entry) {return undefined;}
  if (Date.now() > entry.expiry) {
    store.delete(url);
    return undefined;
  }
  return entry.value as T;
}

/** Store a value with an optional TTL (ms). */
export function setCached<T>(
  url: string,
  value: T,
  ttl: number = DEFAULT_TTL
): void {
  store.set(url, { expiry: Date.now() + ttl, value });
}

/**
 * Deduplicate: if a fetch for this URL is already in flight, await the same promise
 * instead of firing a second request.
 */
export function getInflight<T>(url: string): Promise<T> | undefined {
  return inflight.get(url) as Promise<T> | undefined;
}

export function setInflight<T>(url: string, promise: Promise<T>): Promise<T> {
  inflight.set(url, promise);
  // Clean up the inflight entry when settled. Catch to avoid an unhandled
  // rejection (the caller handles the rejection via the returned promise).
  promise.catch(() => {}).finally(() => inflight.delete(url));
  return promise;
}

/** Invalidate a single entry (useful for testing). */
export function invalidate(url: string): void {
  store.delete(url);
}

/** Clear the entire cache (useful for testing). */
export function clearCache(): void {
  store.clear();
  inflight.clear();
}

// Safety net: never let a cache-related rejection crash the process.
if (typeof process !== "undefined" && process.on) {
  process.on("unhandledRejection", (reason) => {
    console.error("[cache] Unhandled rejection (suppressed):", reason);
  });
}
