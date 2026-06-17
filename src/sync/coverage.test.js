import { describe, it, expect } from "vitest";
import { TELEPORTS, SYNC_UNDETECTABLE_TELEPORTS, SYNC_UNDETECTABLE_UNLOCKS, SYNC_OFTEN_MISSED_TELEPORTS } from "../data.js";
import { TELEPORT_ITEM_IDS } from "./teleportItemIds.js";
import { deriveTeleports, deriveUnlocks } from "./unlocks.js";

// The exact teleports deriveTeleports() can produce WITHOUT an item scan (from
// quests/diaries/Farming level). Mirrors unlocks.js — kept here so the drift test
// fails loudly if the deriver gains/loses a signal without updating data.js.
const SIGNAL_TELEPORTS = ["fairyRing", "lunarSpellbook", "ancientSpellbook", "ectophial", "explorerRing", "ardougneCloak", "farmingCape"];

describe("sync coverage constants stay in step with the derivers", () => {
  const autoCapable = new Set([...SIGNAL_TELEPORTS, ...Object.values(TELEPORT_ITEM_IDS)]);

  it("SYNC_UNDETECTABLE_TELEPORTS is EXACTLY the teleports no deriver can produce", () => {
    for (const t of TELEPORTS) {
      const listedUndetectable = SYNC_UNDETECTABLE_TELEPORTS.includes(t.id);
      // A teleport is auto-capable iff it is NOT in the undetectable list.
      expect(autoCapable.has(t.id)).toBe(!listedUndetectable);
    }
    // Every listed id is a real teleport.
    for (const id of SYNC_UNDETECTABLE_TELEPORTS) {
      expect(TELEPORTS.some(t => t.id === id)).toBe(true);
    }
  });

  it("SIGNAL_TELEPORTS matches what deriveTeleports can emit from quests/diaries/level", () => {
    const emitted = deriveTeleports({
      quests: { fairyTaleII: true, lunarDiplomacy: true, desertTreasureI: true, ghostsAhoy: true },
      diaries: { lumbridge: "Medium", ardougne: "Medium" },
      farmingLevel: 99,
      ownedTeleportIds: [],
    });
    expect(Object.keys(emitted).sort()).toEqual([...SIGNAL_TELEPORTS].sort());
  });

  it("SYNC_OFTEN_MISSED_TELEPORTS are all jewellery AND all auto-detectable from items", () => {
    expect(SYNC_OFTEN_MISSED_TELEPORTS.length).toBeGreaterThan(0);
    for (const id of SYNC_OFTEN_MISSED_TELEPORTS) {
      const t = TELEPORTS.find(tp => tp.id === id);
      expect(t && t.cat).toBe("jewellery");
      expect(autoCapable.has(id)).toBe(true); // it CAN be seen, just commonly mounted/stashed
      expect(SYNC_UNDETECTABLE_TELEPORTS.includes(id)).toBe(false); // disjoint sets
    }
  });

  it("SYNC_UNDETECTABLE_UNLOCKS are real unlocks the deriver never emits", () => {
    const emitted = deriveUnlocks({ quests: { songOfElves: true, boneVoyage: true, theGreatBrainRobbery: true, childrenOfTheSun: true }, farmingLevel: 99 });
    for (const id of SYNC_UNDETECTABLE_UNLOCKS) {
      expect(emitted[id]).toBeUndefined();
    }
  });
});
