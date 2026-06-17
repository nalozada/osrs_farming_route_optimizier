// Quest decoding for Group Ironman tracker data.
//
// Source of ordering: christoabrown/group-ironmen-tracker QuestState.java —
//   sortedQuestIds = Quest.values().map(Quest::getId).sorted()
//   array index = rank of the quest's RuneLite id among all enum ids sorted ascending.
//   value per index = QuestState.ordinal(): 0=NOT_STARTED, 1=IN_PROGRESS, 2=FINISHED.
//
// The 8 quests with RuneLite id <= 180 sit in a version-stable low-id block, so their
// indices never shift. childrenOfTheSun (RuneLite id 3450) is at rank 185 in the
// 209-length array our data uses; if the plugin's quest enum grows with new low-id
// quests, only that one index could shift (recompute as "# of quest ids < 3450").
// Indices computed (and validated against the live data + all 9 known anchors) from
// RuneLite Quest.java: index = rank of the quest's RuneLite id among all enum ids
// sorted ascending (== id-1 in the low-id block). The desertTreasureI/fairyTaleII/
// ghostsAhoy/lunarDiplomacy entries are "signal" quests used only to derive teleports.
export const QUEST_INDEX_TO_ID = {
  10: "boneVoyage",            // Bone Voyage (RL id 11)
  26: "desertTreasureI",       // Desert Treasure I (RL id 27) -> ancient spellbook
  46: "fairyTaleII",           // Fairytale II - Cure a Queen (RL id 47) -> fairy rings
  56: "fremennikTrials",       // The Fremennik Trials (RL id 57)
  61: "ghostsAhoy",            // Ghosts Ahoy (RL id 62) -> ectophial
  66: "theGreatBrainRobbery",  // The Great Brain Robbery (RL id 67)
  87: "lunarDiplomacy",        // Lunar Diplomacy (RL id 88) -> lunar spellbook
  90: "makingFriends",         // Making Friends with My Arm (RL id 91)
  98: "mourningsEndI",         // Mourning's End Part I (RL id 99)
  101: "myArm",                // My Arm's Big Adventure (RL id 102)
  136: "songOfElves",          // Song of the Elves (RL id 137)
  156: "watchtower",           // Watchtower (RL id 157)
  185: "childrenOfTheSun",     // Children of the Sun (RL id 3450)
};

// Quests where merely "started" counts as satisfied (value 1 or 2): mourningsEndI
// (gates Lletya), and fairyTaleII (fairy rings unlock partway through, not on finish).
const STARTED_COUNTS_AS_TRUE = new Set(["mourningsEndI", "fairyTaleII"]);

// Decode the plugin's quests array into { ourQuestId: boolean }. Finished (2) => true;
// for STARTED_COUNTS_AS_TRUE ids, in-progress (1) also => true. Never throws.
export function decodeQuests(arr) {
  const a = Array.isArray(arr) ? arr : [];
  const out = {};
  for (const [idxStr, id] of Object.entries(QUEST_INDEX_TO_ID)) {
    const v = a[Number(idxStr)];
    const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
    out[id] = STARTED_COUNTS_AS_TRUE.has(id) ? n >= 1 : n === 2;
  }
  return out;
}
