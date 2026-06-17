import { describe, it, expect } from "vitest";
import { QUEST_INDEX_TO_ID, decodeQuests } from "./quests.js";

const arr = (set) => {
  const a = new Array(209).fill(0);
  for (const [i, v] of Object.entries(set)) a[Number(i)] = v;
  return a;
};

describe("decodeQuests", () => {
  it("maps finished (2) to true and not-started (0) to false", () => {
    const out = decodeQuests(arr({ 101: 2, 10: 0 }));
    expect(out.myArm).toBe(true);
    expect(out.boneVoyage).toBe(false);
  });

  it("mourningsEndI counts 'started' (1) or finished (2) as true", () => {
    expect(decodeQuests(arr({ 98: 1 })).mourningsEndI).toBe(true);
    expect(decodeQuests(arr({ 98: 2 })).mourningsEndI).toBe(true);
    expect(decodeQuests(arr({ 98: 0 })).mourningsEndI).toBe(false);
  });

  it("a normal quest does NOT treat in-progress as done", () => {
    expect(decodeQuests(arr({ 136: 1 })).songOfElves).toBe(false);
    expect(decodeQuests(arr({ 136: 2 })).songOfElves).toBe(true);
  });

  it("returns all mapped quest ids and never throws on bad input", () => {
    const out = decodeQuests([]);
    expect(Object.keys(out).sort()).toEqual(Object.values(QUEST_INDEX_TO_ID).sort());
    expect(Object.values(out).every(v => v === false)).toBe(true);
    expect(() => decodeQuests(null)).not.toThrow();
    expect(() => decodeQuests("nope")).not.toThrow();
  });

  it("decodes the new teleport-signal quests at their verified indices", () => {
    // Indices validated against RuneLite Quest.java + the live account.
    expect(decodeQuests(arr({ 26: 2 })).desertTreasureI).toBe(true);
    expect(decodeQuests(arr({ 61: 2 })).ghostsAhoy).toBe(true);
    expect(decodeQuests(arr({ 87: 2 })).lunarDiplomacy).toBe(true);
    // fairyTaleII counts as soon as it's started (value 1).
    expect(decodeQuests(arr({ 46: 1 })).fairyTaleII).toBe(true);
    expect(decodeQuests(arr({ 46: 0 })).fairyTaleII).toBe(false);
    // a normal signal quest needs finished
    expect(decodeQuests(arr({ 87: 1 })).lunarDiplomacy).toBe(false);
  });
});
