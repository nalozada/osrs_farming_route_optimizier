import { describe, it, expect } from "vitest";
import { PATCHES } from "./data.js";
import {
  normalizeProfile,
  defaultProfile,
  isProfileEmpty,
  meetsReqs,
  generateRoute,
  getAllRouteItems,
  plantableSeedTypes,
  hasPlantableSeed,
  baseSeedName,
  consolidateRunes,
  categorizeItems,
} from "./engine.js";

const patch = id => PATCHES.find(p => p.id === id);
// Build a profile, then normalize so all sub-objects exist.
const profile = (over = {}) => normalizeProfile({ ...defaultProfile(), ...over });

describe("normalizeProfile", () => {
  it("fills missing sub-objects so the engine can't crash on undefined", () => {
    const p = normalizeProfile({ quests: { myArm: true } });
    expect(p.diaries).toEqual({});
    expect(p.teleports).toEqual({});
    expect(p.unlocks).toEqual({});
    expect(p.quests.myArm).toBe(true);
  });
  it("clamps farmingLevel into 1..99 and coerces non-numbers", () => {
    expect(normalizeProfile({ farmingLevel: 250 }).farmingLevel).toBe(99);
    expect(normalizeProfile({ farmingLevel: -5 }).farmingLevel).toBe(1);
    expect(normalizeProfile({ farmingLevel: "abc" }).farmingLevel).toBe(1);
    expect(normalizeProfile({ farmingLevel: 73 }).farmingLevel).toBe(73);
  });
  it("returns a default profile for garbage input", () => {
    expect(normalizeProfile(null)).toEqual(defaultProfile());
    expect(normalizeProfile(42)).toEqual(defaultProfile());
  });
});

describe("isProfileEmpty", () => {
  it("is true for a blank profile and false once anything is set", () => {
    expect(isProfileEmpty(defaultProfile())).toBe(true);
    expect(isProfileEmpty(profile({ teleports: { explorerRing: true } }))).toBe(false);
    expect(isProfileEmpty(profile({ diaries: { kandarin: "Hard" } }))).toBe(false);
  });
});

describe("meetsReqs", () => {
  it("respects quest gating", () => {
    const troll = patch("herb_trollStronghold");
    expect(meetsReqs(troll, profile())).toBe(false);
    expect(meetsReqs(troll, profile({ quests: { myArm: true } }))).toBe(true);
  });

  it("gates Farming Guild tiers on Farming level, not just the unlock", () => {
    const guildHerb = patch("herb_farmingGuild"); // requires farmingGuild (65) unlock
    expect(meetsReqs(guildHerb, profile({ unlocks: { farmingGuild: true }, farmingLevel: 40 }))).toBe(false);
    expect(meetsReqs(guildHerb, profile({ unlocks: { farmingGuild: true }, farmingLevel: 70 }))).toBe(true);
  });

  it("requires the new quests wired in by the review (Etceteria, Lletya, Harmony)", () => {
    expect(meetsReqs(patch("bush_etceteria"), profile())).toBe(false);
    expect(meetsReqs(patch("bush_etceteria"), profile({ quests: { fremennikTrials: true } }))).toBe(true);

    expect(meetsReqs(patch("fruit_lletya"), profile({ quests: { fremennikTrials: true } }))).toBe(false);
    expect(meetsReqs(patch("fruit_lletya"), profile({ quests: { mourningsEndI: true } }))).toBe(true);

    const harmonyOk = profile({ quests: { theGreatBrainRobbery: true }, diaries: { morytania: "Elite" }, unlocks: { harmonyIsland: true } });
    expect(meetsReqs(patch("herb_harmony"), harmonyOk)).toBe(true);
    // Missing the quest -> not reachable even with the diary + unlock.
    expect(meetsReqs(patch("herb_harmony"), profile({ diaries: { morytania: "Elite" }, unlocks: { harmonyIsland: true } }))).toBe(false);
  });

  it("Weiss uses the corrected Fire of Nourishment unlock id", () => {
    const weiss = patch("herb_weiss");
    expect(weiss.requirements.unlocks).toContain("fireOfNourishment");
    expect(meetsReqs(weiss, profile({ quests: { makingFriends: true }, unlocks: { fireOfNourishment: true } }))).toBe(true);
  });
});

describe("generateRoute", () => {
  it("returns an empty array when nothing is reachable", () => {
    // Seaweed needs Bone Voyage + Fossil Island; a blank profile reaches nothing.
    expect(generateRoute(["seaweed"], profile(), {})).toEqual([]);
  });

  it("produces an initial bank stop followed by reachable stops", () => {
    const route = generateRoute(["herb"], profile({ teleports: { explorerRing: true } }), { herb: "ranarr" });
    expect(route.length).toBeGreaterThan(1);
    expect(route[0].isBank).toBe(true);
    expect(route[0].isInitial).toBe(true);
    const stops = route.filter(s => !s.isBank);
    expect(stops.length).toBeGreaterThan(0);
    // Falador herb patch is reachable via Explorer's Ring.
    expect(stops.some(s => s.key === "falador_south")).toBe(true);
    // Every stop is sequentially numbered.
    route.forEach((s, i) => expect(s.step).toBe(i + 1));
  });

  it("does NOT apply the Catherby charter when Catherby is not visited first", () => {
    // Only Amulet of Glory: Brimhaven clusters before Catherby, so no charter.
    const route = generateRoute(["fruitTree"], profile({ teleports: { amuletOfGlory: true } }), { fruitTree: "apple" });
    const brim = route.find(s => s.key === "brimhaven");
    expect(brim).toBeTruthy();
    expect(brim.teleport.toLowerCase()).not.toContain("charter");
  });

  it("applies the Catherby charter only when Catherby precedes Brimhaven", () => {
    // Lunar puts Catherby at speed 1 (before Brimhaven), enabling the charter.
    const route = generateRoute(["fruitTree"], profile({ teleports: { lunarSpellbook: true, amuletOfGlory: true } }), { fruitTree: "apple" });
    const stops = route.filter(s => !s.isBank);
    const ci = stops.findIndex(s => s.key === "catherby_area");
    const bi = stops.findIndex(s => s.key === "brimhaven");
    expect(ci).toBeGreaterThanOrEqual(0);
    expect(bi).toBeGreaterThan(ci); // Catherby first
    expect(stops[bi].teleport.toLowerCase()).toContain("charter");
  });

  it("aggregates every item needed across the route", () => {
    const route = generateRoute(["herb"], profile({ teleports: { explorerRing: true } }), { herb: "ranarr" });
    const { equipment, farming } = getAllRouteItems(route);
    expect(Array.isArray(equipment)).toBe(true);
    expect(farming.some(it => it.toLowerCase().includes("ranarr"))).toBe(true);
  });
});

describe("plantableSeedTypes / hasPlantableSeed (bank-material awareness)", () => {
  it("baseSeedName strips ×N suffixes", () => {
    expect(baseSeedName("Potato seed ×3")).toBe("Potato seed");
    expect(baseSeedName("Ranarr seed")).toBe("Ranarr seed");
    expect(baseSeedName(null)).toBe(null);
  });

  it("adds no bank restriction when bank data is absent (still level-gated)", () => {
    // At 99 with no bank data, every type has a plantable crop => all true.
    const all = plantableSeedTypes({ farmingLevel: 99 }, null);
    expect(Object.values(all).every(Boolean)).toBe(true);
    expect(hasPlantableSeed("herb", { farmingLevel: 99 }, null)).toBe(true);
    // Level still gates even with no bank data (herb's lowest crop is lvl 9).
    expect(hasPlantableSeed("herb", { farmingLevel: 1 }, null)).toBe(false);
  });

  it("requires both farming level AND owning the seed", () => {
    // Owns only Ranarr seed (herb, lvl 32).
    const owned = new Set(["Ranarr seed"]);
    expect(plantableSeedTypes({ farmingLevel: 80 }, owned).herb).toBe(true);
    expect(plantableSeedTypes({ farmingLevel: 80 }, owned).allotment).toBe(false); // no allotment seed owned
    // Below Ranarr level => herb false even though owned.
    expect(plantableSeedTypes({ farmingLevel: 20 }, owned).herb).toBe(false);
  });

  it("normalizes the bank's plain names against CROPS' ×N seed strings", () => {
    // Bank stores "Potato seed"; CROPS allotment seed is "Potato seed ×3".
    expect(plantableSeedTypes({ farmingLevel: 10 }, new Set(["Potato seed"])).allotment).toBe(true);
  });

  it("pick-only types (bush/cactus) are available without any seed", () => {
    const r = plantableSeedTypes({ farmingLevel: 99 }, new Set());
    expect(r.bush).toBe(true);
    expect(r.cactus).toBe(true);
    expect(r.herb).toBe(false); // herb has no pick-only crop
  });
});

describe("consolidateRunes", () => {
  it("collapses ×N and plain rune variants into one pluralized entry", () => {
    const out = consolidateRunes(["Law rune", "Air rune", "Earth rune", "Law rune ×2", "Earth rune ×2", "Fire rune", "Water rune"]);
    expect(out).toEqual(["Law runes", "Air runes", "Earth runes", "Fire runes", "Water runes"]);
  });

  it("leaves spellbook bundles and non-rune items untouched", () => {
    expect(consolidateRunes(["Runes (Lunar)", "Runes (Arceuus: Soul, Law, Nature)"]))
      .toEqual(["Runes (Lunar)", "Runes (Arceuus: Soul, Law, Nature)"]);
    expect(consolidateRunes(["Dramen/Lunar staff"])).toEqual(["Dramen/Lunar staff"]);
  });

  it("categorizeItems emits consolidated runes (no ×N, no dupes)", () => {
    const cats = categorizeItems(["Law rune", "Law rune ×2", "Earth rune ×2", "Spade"]);
    const runes = cats.find(c => c.label.includes("Runes"));
    expect(runes.items).toEqual(["Law runes", "Earth runes"]);
  });
});
