import { describe, it, expect } from "vitest";
import { SEED_ITEM_IDS, normalizeSeedName, ownedSeedNamesFromBank } from "./itemIds.js";
import { CROPS } from "../data.js";
import { baseSeedName } from "../engine.js";

describe("normalizeSeedName", () => {
  it("strips quantity suffixes", () => {
    expect(normalizeSeedName("Potato seed ×3")).toBe("Potato seed");
    expect(normalizeSeedName("Snape grass seed ×3")).toBe("Snape grass seed");
    expect(normalizeSeedName("Barley seed ×4")).toBe("Barley seed");
    expect(normalizeSeedName("Ranarr seed")).toBe("Ranarr seed");
  });
});

describe("SEED_ITEM_IDS covers every CROPS seed (drift guard)", () => {
  it("every plantable crop seed name resolves to an item id", () => {
    const known = new Set(Object.values(SEED_ITEM_IDS));
    const missing = [];
    for (const type of Object.keys(CROPS)) {
      for (const c of CROPS[type]) {
        if (!c.seed) continue; // pick-only / no-seed crops
        const name = baseSeedName(c.seed);
        if (!known.has(name)) missing.push(`${type}:${c.id} -> "${name}"`);
      }
    }
    expect(missing).toEqual([]);
  });
});

describe("ownedSeedNamesFromBank", () => {
  it("resolves ids, ignores non-seeds and qty 0, collapses raw seeds to saplings", () => {
    // 5295 Ranarr seed, 5312 Acorn -> "Oak sapling", 995 coins (ignored), 5290 Calquat tree seed -> "Calquat sapling"
    const owned = ownedSeedNamesFromBank([5295, 1, 5312, 1, 995, 1000000, 5290, 1, 5304, 0]);
    expect(owned.has("Ranarr seed")).toBe(true);
    expect(owned.has("Oak sapling")).toBe(true);
    expect(owned.has("Calquat sapling")).toBe(true);
    expect(owned.has("Torstol seed")).toBe(false); // qty 0
    expect([...owned]).not.toContain(undefined);
  });

  it("merges across multiple arrays and tolerates junk", () => {
    const owned = ownedSeedNamesFromBank([5295, 1], null, [5318, 5]);
    expect(owned.has("Ranarr seed")).toBe(true);
    expect(owned.has("Potato seed")).toBe(true);
  });
});
