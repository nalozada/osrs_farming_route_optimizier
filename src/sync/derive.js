// Turn a raw Group Ironman tracker player object into the minimal AccountData the
// app needs. Pure + dependency-free so it runs identically in the Cloudflare Worker
// (server-side) and in the browser/tests. Deliberately emits NO raw bank, item ids,
// coordinates, or non-farming data.
import { farmingLevelFromSkills } from "./skills.js";
import { decodeQuests } from "./quests.js";
import { decodeDiaries } from "./diaries.js";
import { ownedSeedNamesFromBank, ownedSeedCountsFromBank } from "./itemIds.js";
import { ownedTeleportIdsFromItems } from "./teleportItemIds.js";
import { deriveTeleports, deriveUnlocks } from "./unlocks.js";
import { plantableSeedTypes } from "../engine.js";

export function deriveAccountData(player, updatedAt) {
  const p = player || {};
  const farmingLevel = farmingLevelFromSkills(p.skills);
  const quests = decodeQuests(p.quests);
  const diaries = decodeDiaries(p.diary_vars);
  const owned = ownedSeedNamesFromBank(p.bank, p.inventory, p.seed_vault);
  const ownedTeleportIds = ownedTeleportIdsFromItems(p.bank, p.inventory, p.equipment, p.rune_pouch, p.seed_vault);
  return {
    updatedAt: updatedAt || null,
    farmingLevel,
    quests,
    diaries,
    // Detected teleport/unlock toggles — ADDITIVE only (the derivers emit only `true`),
    // so merging them can never turn off a manual toggle (e.g. a POH-mounted glory).
    teleports: deriveTeleports({ quests, diaries, farmingLevel, ownedTeleportIds }),
    unlocks: deriveUnlocks({ quests, farmingLevel }),
    // Per-patch-type boolean: do you own a seed plantable at your level?
    seeds: plantableSeedTypes({ farmingLevel }, owned),
    // The plantable seed names you own (for display). Names only — no item ids.
    ownedSeedNames: [...owned].sort(),
    // Seed name -> quantity owned, for planning a crop mix limited by what you have.
    ownedSeedCounts: ownedSeedCountsFromBank(p.bank, p.inventory, p.seed_vault),
  };
}
