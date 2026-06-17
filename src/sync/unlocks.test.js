import { describe, it, expect } from "vitest";
import { deriveTeleports, deriveUnlocks } from "./unlocks.js";
import { TELEPORTS, OTHER_UNLOCKS } from "../data.js";

const TP_IDS = new Set(TELEPORTS.map(t => t.id));
const UNLOCK_IDS = new Set(OTHER_UNLOCKS.map(u => u.id));

describe("deriveTeleports", () => {
  it("emits ONLY true keys (additive merge guarantee)", () => {
    const out = deriveTeleports({ quests: { fairyTaleII: true }, diaries: {}, farmingLevel: 99, ownedTeleportIds: ["amuletOfGlory"] });
    expect(Object.values(out).every(v => v === true)).toBe(true);
  });

  it("derives reliable teleports from quests/diaries/level", () => {
    const out = deriveTeleports({
      quests: { fairyTaleII: true, lunarDiplomacy: true, desertTreasureI: true, ghostsAhoy: true },
      diaries: { lumbridge: "Hard", ardougne: "Medium" },
      farmingLevel: 99,
      ownedTeleportIds: [],
    });
    expect(out.fairyRing).toBe(true);
    expect(out.lunarSpellbook).toBe(true);
    expect(out.ancientSpellbook).toBe(true);
    expect(out.ectophial).toBe(true);
    expect(out.explorerRing).toBe(true);   // L&D >= Medium
    expect(out.ardougneCloak).toBe(true);  // Ardougne >= Medium
    expect(out.farmingCape).toBe(true);    // 99
  });

  it("does not derive diary teleports below Medium, or farmingCape below 99", () => {
    const out = deriveTeleports({ quests: {}, diaries: { lumbridge: "Easy", ardougne: "None" }, farmingLevel: 98, ownedTeleportIds: [] });
    expect(out.explorerRing).toBeUndefined();
    expect(out.ardougneCloak).toBeUndefined();
    expect(out.farmingCape).toBeUndefined();
  });

  it("turns on item-detected teleports but NOT undetected ones (POH glory stays manual)", () => {
    // Player's glory is mounted in their POH -> not in ownedTeleportIds.
    const out = deriveTeleports({ quests: {}, diaries: {}, farmingLevel: 1, ownedTeleportIds: ["ringOfDueling", "skillsNecklace"] });
    expect(out.ringOfDueling).toBe(true);
    expect(out.skillsNecklace).toBe(true);
    expect(out.amuletOfGlory).toBeUndefined(); // not detected -> left for manual

    // The additive merge: a profile with glory manually on keeps it on.
    const merged = { ...{ amuletOfGlory: true }, ...out };
    expect(merged.amuletOfGlory).toBe(true);
  });

  it("only emits real TELEPORTS ids and never the non-derivable ones", () => {
    const out = deriveTeleports({
      quests: { fairyTaleII: true, lunarDiplomacy: true, desertTreasureI: true, ghostsAhoy: true },
      diaries: { lumbridge: "Elite", ardougne: "Elite" }, farmingLevel: 99,
      ownedTeleportIds: ["xericTalisman", "quetzalWhistle"],
    });
    for (const id of Object.keys(out)) expect(TP_IDS.has(id)).toBe(true);
    for (const id of ["spiritTreePrif", "spiritTreeFarmingGuild", "arceuusSpellbook"]) {
      expect(out[id]).toBeUndefined();
    }
  });
});

describe("deriveUnlocks", () => {
  it("emits only true keys, gated by level and quests", () => {
    const out = deriveUnlocks({ quests: { songOfElves: true, boneVoyage: true, theGreatBrainRobbery: true, childrenOfTheSun: true }, farmingLevel: 85 });
    expect(Object.values(out).every(v => v === true)).toBe(true);
    expect(out.farmingGuild45).toBe(true);
    expect(out.farmingGuild).toBe(true);
    expect(out.farmingGuild85).toBe(true);
    expect(out.prifAccess).toBe(true);
    expect(out.fossilIsland).toBe(true);
    expect(out.harmonyIsland).toBe(true);
    expect(out.varlamoreAccess).toBe(true);
  });

  it("respects level thresholds and never emits non-derivable unlocks", () => {
    const out = deriveUnlocks({ quests: {}, farmingLevel: 50 });
    expect(out.farmingGuild45).toBe(true);
    expect(out.farmingGuild).toBeUndefined(); // needs 65
    expect(out.farmingGuild85).toBeUndefined();
    for (const id of Object.keys(out)) expect(UNLOCK_IDS.has(id)).toBe(true);
    expect(out.kastoriQuetzal).toBeUndefined();
    expect(out.fireOfNourishment).toBeUndefined();
  });
});
