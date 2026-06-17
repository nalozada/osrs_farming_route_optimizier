import { describe, it, expect } from "vitest";
import { deriveAccountData } from "./derive.js";
import { plantableSeedTypes } from "../engine.js";

function fakePlayer() {
  const skills = new Array(24).fill(0);
  skills[19] = 2142721; // farming 80
  const quests = new Array(209).fill(0);
  quests[101] = 2; // myArm finished
  quests[98] = 1;  // mourningsEndI started
  const diary_vars = new Array(62).fill(0);
  diary_vars[4] = 0b11111111111; // Falador Easy
  return { skills, quests, diary_vars, bank: [5295, 1, 995, 1000000], inventory: [5318, 3] };
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
    expect(json).not.toContain("5295"); // no item ids in output
    expect(json).not.toContain("1000000"); // no quantities
    expect(a.ownedSeedNames.every(n => typeof n === "string")).toBe(true);
  });

  it("does not throw on an empty player", () => {
    expect(() => deriveAccountData({}, null)).not.toThrow();
    expect(deriveAccountData(null, null).farmingLevel).toBe(1);
  });
});
