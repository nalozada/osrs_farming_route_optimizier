// Turn a raw Group Ironman tracker player object into the minimal AccountData the
// app needs. Pure + dependency-free so it runs identically in the Cloudflare Worker
// (server-side) and in the browser/tests. Deliberately emits NO raw bank, item ids,
// coordinates, or non-farming data.
import { farmingLevelFromSkills } from "./skills.js";
import { decodeQuests } from "./quests.js";
import { decodeDiaries } from "./diaries.js";
import { ownedSeedNamesFromBank } from "./itemIds.js";
import { plantableSeedTypes } from "../engine.js";

export function deriveAccountData(player, updatedAt) {
  const p = player || {};
  const farmingLevel = farmingLevelFromSkills(p.skills);
  const quests = decodeQuests(p.quests);
  const diaries = decodeDiaries(p.diary_vars);
  const owned = ownedSeedNamesFromBank(p.bank, p.inventory, p.seed_vault);
  return {
    updatedAt: updatedAt || null,
    farmingLevel,
    quests,
    diaries,
    // Per-patch-type boolean: do you own a seed plantable at your level?
    seeds: plantableSeedTypes({ farmingLevel }, owned),
    // The plantable seed names you own (for display). Names only — no item ids.
    ownedSeedNames: [...owned].sort(),
  };
}
