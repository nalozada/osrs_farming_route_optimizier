import { describe, it, expect } from "vitest";
import { deriveAccountData } from "./derive.js";
import { plantableSeedTypes } from "../engine.js";

function fakePlayer() {
  const skills = new Array(24).fill(0);
  skills[19] = 2142721; // farming 80
  const quests = new Array(209).fill(0);
  quests[101] = 2; // myArm finished
  quests[98] = 1;  // mourningsEndI started
  quests[26] = 2;  // desertTreasureI -> ancientSpellbook
  quests[136] = 2; // songOfElves -> prifAccess
  const diary_vars = new Array(62).fill(0);
  diary_vars[4] = 0b11111111111; // Falador Easy
  // bank: Ranarr seed (5295), coins (995), Ring of dueling(8) (2552); inventory: Potato seed (5318)
  return { skills, quests, diary_vars, bank: [5295, 1, 995, 1000000, 2552, 1], inventory: [5318, 3] };
}

describe("deriveAccountData", () => {
  it("produces the minimal account shape", () => {
    const a = deriveAccountData(fakePlayer(), "2026-06-17T00:00:00.000Z");
    expect(a.updatedAt).toBe("2026-06-17T00:00:00.000Z");
    expect(a.farmingLevel).toBe(80);
    expect(a.quests.myArm).toBe(true);
    expect(a.quests.mourningsEndI).toBe(true);
    expect(a.diaries.falador).toBe("Easy");
    expect(a.ownedSeedNames).toContain("Ranarr seed");
    expect(a.ownedSeedNames).toContain("Potato seed");
    expect(a.seeds.herb).toBe(true);       // owns Ranarr seed, plantable at 80
    expect(a.seeds.allotment).toBe(true);  // owns Potato seed
  });

  it("derives teleports (quest + item) and unlocks (level + quest), additive only", () => {
    const a = deriveAccountData(fakePlayer(), null);
    expect(a.teleports.ancientSpellbook).toBe(true); // Desert Treasure I
    expect(a.teleports.ringOfDueling).toBe(true);    // owned in bank
    expect(Object.values(a.teleports).every(v => v === true)).toBe(true);
    expect(a.unlocks.farmingGuild45).toBe(true);     // farming 80
    expect(a.unlocks.farmingGuild).toBe(true);       // 65
    expect(a.unlocks.farmingGuild85).toBeUndefined();// needs 85
    expect(a.unlocks.prifAccess).toBe(true);         // Song of the Elves
    expect(Object.values(a.unlocks).every(v => v === true)).toBe(true);
  });

  it("includes ownedSeedCounts with real quantities", () => {
    const a = deriveAccountData(fakePlayer(), null);
    expect(a.ownedSeedCounts["Ranarr seed"]).toBe(1);
    expect(a.ownedSeedCounts["Potato seed"]).toBe(3);
  });

  it("seeds map equals plantableSeedTypes for the same inputs (cross-consistency)", () => {
    const a = deriveAccountData(fakePlayer(), null);
    const expected = plantableSeedTypes({ farmingLevel: 80 }, new Set(["Ranarr seed", "Potato seed"]));
    expect(a.seeds).toEqual(expected);
  });

  it("never leaks raw bank / item ids", () => {
    const a = deriveAccountData(fakePlayer(), null);
    expect("bank" in a).toBe(false);
    expect("inventory" in a).toBe(false);
    const json = JSON.stringify(a);
    expect(json).not.toContain("5295"); // no seed item ids in output
    expect(json).not.toContain("2552"); // no teleport item ids in output
    expect(json).not.toContain("1000000"); // no raw quantities
    expect(a.ownedSeedNames.every(n => typeof n === "string")).toBe(true);
  });

  it("does not throw on an empty player", () => {
    expect(() => deriveAccountData({}, null)).not.toThrow();
    expect(deriveAccountData(null, null).farmingLevel).toBe(1);
  });
});
