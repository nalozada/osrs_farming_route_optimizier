// Derive "Teleports & Transportation" and "Other Unlocks" from Group Ironman tracker
// data. Pure. CRUCIAL: both derivers emit ONLY `true` keys, so merging them into a
// profile (spread) can never turn a manual toggle OFF — this preserves teleports the
// tracker can't see (e.g. a glory mounted in your POH, items stashed in a STASH unit).
import { DIARY_TIERS } from "../data.js";

function diaryAtLeast(diaries, id, tier) {
  return DIARY_TIERS.indexOf((diaries && diaries[id]) || "None") >= DIARY_TIERS.indexOf(tier);
}

// quests/diaries come from decodeQuests/decodeDiaries; ownedTeleportIds is a Set/array
// of our teleport ids detected from the player's items.
export function deriveTeleports({ quests, diaries, farmingLevel, ownedTeleportIds } = {}) {
  const q = quests || {};
  const out = {};
  const on = id => { out[id] = true; };

  // Reliable, no item lookup needed:
  if (q.fairyTaleII) on("fairyRing");          // started partway through Fairy Tale II
  if (q.lunarDiplomacy) on("lunarSpellbook");
  if (q.desertTreasureI) on("ancientSpellbook");
  if (q.ghostsAhoy) on("ectophial");
  if (diaryAtLeast(diaries, "lumbridge", "Medium")) on("explorerRing");
  if (diaryAtLeast(diaries, "ardougne", "Medium")) on("ardougneCloak");
  if ((farmingLevel || 1) >= 99) on("farmingCape");

  // Item-ownership (additive — only ever turns things on):
  for (const id of ownedTeleportIds || []) on(id);

  return out;
}

export function deriveUnlocks({ quests, farmingLevel } = {}) {
  const q = quests || {};
  const lvl = farmingLevel || 1;
  const out = {};
  const on = id => { out[id] = true; };

  if (lvl >= 45) on("farmingGuild45");
  if (lvl >= 65) on("farmingGuild");
  if (lvl >= 85) on("farmingGuild85");
  if (q.songOfElves) on("prifAccess");
  if (q.boneVoyage) on("fossilIsland");
  if (q.theGreatBrainRobbery) on("harmonyIsland");
  if (q.childrenOfTheSun) on("varlamoreAccess");

  // Never derived (stay manual): planted spirit trees, kastoriQuetzal,
  // fireOfNourishment, arceuusSpellbook.
  return out;
}
