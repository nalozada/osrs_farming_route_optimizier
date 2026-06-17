import { describe, it, expect } from "vitest";
import { TELEPORT_ITEM_IDS, ownedTeleportIdsFromItems } from "./teleportItemIds.js";
import { TELEPORTS } from "../data.js";

// Pick a representative item id that maps to a given teleport family.
const idFor = tp => Number(Object.keys(TELEPORT_ITEM_IDS).find(id => TELEPORT_ITEM_IDS[id] === tp));

describe("teleportItemIds", () => {
  it("every mapped teleport id is a real TELEPORTS id (drift guard)", () => {
    const valid = new Set(TELEPORTS.map(t => t.id));
    const bad = [...new Set(Object.values(TELEPORT_ITEM_IDS))].filter(id => !valid.has(id));
    expect(bad).toEqual([]);
  });

  it("covers the expected teleport families with charge variants", () => {
    for (const tp of ["amuletOfGlory", "ringOfDueling", "ringOfWealth", "slayerRing", "quetzalWhistle", "digsitePendant", "pendantOfAtes", "skillsNecklace", "teleportCrystal"]) {
      expect(idFor(tp)).toBeTruthy();
    }
    // glory should have many charge/trouver variants
    const gloryCount = Object.values(TELEPORT_ITEM_IDS).filter(v => v === "amuletOfGlory").length;
    expect(gloryCount).toBeGreaterThan(5);
  });

  it("detects owned teleports across containers; ignores non-teleports and qty<=0", () => {
    const duel = idFor("ringOfDueling");
    const skills = idFor("skillsNecklace");
    const glory = idFor("amuletOfGlory");
    const owned = ownedTeleportIdsFromItems(
      [duel, 1, 995, 1000000],   // bank: ring of dueling + coins
      [skills, 8],               // inventory: skills necklace
      [glory, 0],                // equipment: glory with qty 0 -> ignored
    );
    expect(owned.has("ringOfDueling")).toBe(true);
    expect(owned.has("skillsNecklace")).toBe(true);
    expect(owned.has("amuletOfGlory")).toBe(false); // qty 0 (mirrors a POH-mounted glory: simply absent)
    expect(owned.has("coins")).toBe(false);
  });

  it("never throws on junk input", () => {
    expect(() => ownedTeleportIdsFromItems(null, undefined, "x", [1])).not.toThrow();
  });
});
