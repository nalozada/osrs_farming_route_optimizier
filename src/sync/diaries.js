// Achievement-diary decoding for Group Ironman tracker data.
//
// Ported from:
//   christoabrown/group-ironmen        site/src/data/diaries.js (parseDiaryData)
//                                       site/src/utility.js      (isBitSet)
//   christoabrown/group-ironmen-tracker AchievementDiaryState.java (diary_vars layout)
//
// diary_vars (length 62): indices 0..22 are varp bit-fields (read by bit offset),
// index 10 is the Karamja Elite varp, and indices 23..61 are Karamja Easy/Medium/Hard
// stored as discrete varbit values. We return the HIGHEST fully-completed tier per diary.

const TIER_ORDER = ["Easy", "Medium", "Hard", "Elite"];

function num(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}
// JS bitwise ops coerce to signed 32-bit, matching the plugin's i32 values (incl. negatives).
function bit(dv, index, offset) {
  return ((num(dv[index]) | 0) & (1 << offset)) !== 0;
}
function val(dv, index, expected) {
  return num(dv[index]) === expected;
}

// Per-diary, per-tier task readers, faithfully ported from parseDiaryData.
export const DIARY_VAR_LAYOUT = {
  Ardougne: {
    Easy: (d) => [0, 1, 2, 4, 5, 6, 7, 9, 11, 12].map((b) => bit(d, 0, b)),
    Medium: (d) => [13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25].map((b) => bit(d, 0, b)),
    Hard: (d) => [
      bit(d, 0, 26), bit(d, 0, 27), bit(d, 0, 28), bit(d, 0, 29), bit(d, 0, 30), bit(d, 0, 31),
      bit(d, 1, 0), bit(d, 1, 1), bit(d, 1, 2), bit(d, 1, 3), bit(d, 1, 4), bit(d, 1, 5),
    ],
    Elite: (d) => [6, 7, 9, 8, 10, 11, 12, 13].map((b) => bit(d, 1, b)),
  },
  Desert: {
    Easy: (d) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((b) => bit(d, 2, b)),
    Medium: (d) => [
      bit(d, 2, 12), bit(d, 2, 13), bit(d, 2, 14), bit(d, 2, 15), bit(d, 2, 16), bit(d, 2, 17),
      bit(d, 2, 18), bit(d, 2, 19), bit(d, 2, 20), bit(d, 2, 21),
      bit(d, 2, 22) || bit(d, 3, 9), bit(d, 2, 23),
    ],
    Hard: (d) => [
      bit(d, 2, 24), bit(d, 2, 25), bit(d, 2, 26), bit(d, 2, 27), bit(d, 2, 28), bit(d, 2, 29),
      bit(d, 2, 30), bit(d, 2, 31), bit(d, 3, 0), bit(d, 3, 1),
    ],
    Elite: (d) => [2, 4, 5, 6, 7, 8].map((b) => bit(d, 3, b)),
  },
  Falador: {
    Easy: (d) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((b) => bit(d, 4, b)),
    Medium: (d) => [11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25].map((b) => bit(d, 4, b)),
    Hard: (d) => [
      bit(d, 4, 26), bit(d, 4, 27), bit(d, 4, 28), bit(d, 4, 29), bit(d, 4, 30), bit(d, 4, 31),
      bit(d, 5, 0), bit(d, 5, 1), bit(d, 5, 2), bit(d, 5, 3), bit(d, 5, 4),
    ],
    Elite: (d) => [5, 6, 7, 8, 9, 10].map((b) => bit(d, 5, b)),
  },
  Fremennik: {
    Easy: (d) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((b) => bit(d, 6, b)),
    Medium: (d) => [11, 12, 13, 14, 15, 17, 18, 19, 20].map((b) => bit(d, 6, b)),
    Hard: (d) => [21, 23, 24, 25, 26, 27, 28, 29, 30].map((b) => bit(d, 6, b)),
    Elite: (d) => [bit(d, 6, 31), bit(d, 7, 0), bit(d, 7, 1), bit(d, 7, 2), bit(d, 7, 3), bit(d, 7, 4)],
  },
  Kandarin: {
    Easy: (d) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((b) => bit(d, 8, b)),
    Medium: (d) => [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].map((b) => bit(d, 8, b)),
    Hard: (d) => [
      bit(d, 8, 26), bit(d, 8, 27), bit(d, 8, 28), bit(d, 8, 29), bit(d, 8, 30), bit(d, 8, 31),
      bit(d, 9, 0), bit(d, 9, 1), bit(d, 9, 2), bit(d, 9, 3), bit(d, 9, 4),
    ],
    Elite: (d) => [5, 6, 7, 8, 9, 10, 11].map((b) => bit(d, 9, b)),
  },
  Karamja: {
    // Easy/Medium/Hard are discrete varbit values at indices 23..61 (not bit-packed).
    Easy: (d) => [
      val(d, 23, 5), val(d, 24, 1), val(d, 25, 1), val(d, 26, 1), val(d, 27, 1),
      val(d, 28, 1), val(d, 29, 1), val(d, 30, 5), val(d, 31, 1), val(d, 32, 1),
    ],
    Medium: (d) => [
      val(d, 33, 1), val(d, 34, 1), val(d, 35, 1), val(d, 36, 1), val(d, 37, 1), val(d, 38, 1), val(d, 39, 1),
      val(d, 40, 1), val(d, 41, 1), val(d, 42, 1), val(d, 43, 1), val(d, 44, 1), val(d, 45, 1), val(d, 46, 1),
      val(d, 47, 1), val(d, 48, 1), val(d, 49, 1), val(d, 50, 1), val(d, 51, 1),
    ],
    Hard: (d) => [
      val(d, 52, 1), val(d, 53, 1), val(d, 54, 1), val(d, 55, 1), val(d, 56, 1),
      val(d, 57, 1), val(d, 58, 1), val(d, 59, 5), val(d, 60, 1), val(d, 61, 1),
    ],
    Elite: (d) => [1, 2, 3, 4, 5].map((b) => bit(d, 10, b)), // Karamja Elite varp at index 10
  },
  "Kourend & Kebos": {
    Easy: (d) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((b) => bit(d, 11, b)),
    Medium: (d) => [25, 13, 14, 15, 21, 16, 17, 18, 19, 22, 20, 23, 24].map((b) => bit(d, 11, b)),
    Hard: (d) => [
      bit(d, 11, 26), bit(d, 11, 27), bit(d, 11, 28), bit(d, 11, 29), bit(d, 11, 31), bit(d, 11, 30),
      bit(d, 12, 0), bit(d, 12, 1), bit(d, 12, 2), bit(d, 12, 3),
    ],
    Elite: (d) => [4, 5, 6, 7, 8, 9, 10, 11].map((b) => bit(d, 12, b)),
  },
  "Lumbridge & Draynor": {
    Easy: (d) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((b) => bit(d, 13, b)),
    Medium: (d) => [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map((b) => bit(d, 13, b)),
    Hard: (d) => [
      bit(d, 13, 25), bit(d, 13, 26), bit(d, 13, 27), bit(d, 13, 28), bit(d, 13, 29), bit(d, 13, 30), bit(d, 13, 31),
      bit(d, 14, 0), bit(d, 14, 1), bit(d, 14, 2), bit(d, 14, 3),
    ],
    Elite: (d) => [4, 5, 6, 7, 8, 9].map((b) => bit(d, 14, b)),
  },
  Morytania: {
    Easy: (d) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((b) => bit(d, 15, b)),
    Medium: (d) => [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((b) => bit(d, 15, b)),
    Hard: (d) => [
      bit(d, 15, 23), bit(d, 15, 24), bit(d, 15, 25), bit(d, 15, 26), bit(d, 15, 27),
      bit(d, 15, 28), bit(d, 15, 29), bit(d, 15, 30), bit(d, 16, 1), bit(d, 16, 2),
    ],
    Elite: (d) => [3, 4, 5, 6, 7, 8].map((b) => bit(d, 16, b)),
  },
  Varrock: {
    Easy: (d) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((b) => bit(d, 17, b)),
    Medium: (d) => [15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].map((b) => bit(d, 17, b)),
    Hard: (d) => [
      bit(d, 17, 29), bit(d, 17, 30), bit(d, 17, 31),
      bit(d, 18, 0), bit(d, 18, 1), bit(d, 18, 2), bit(d, 18, 3), bit(d, 18, 4), bit(d, 18, 5), bit(d, 18, 6),
    ],
    Elite: (d) => [7, 8, 9, 10, 11].map((b) => bit(d, 18, b)),
  },
  "Western Provinces": {
    Easy: (d) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((b) => bit(d, 19, b)),
    Medium: (d) => [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map((b) => bit(d, 19, b)),
    Hard: (d) => [
      bit(d, 19, 25), bit(d, 19, 26), bit(d, 19, 27), bit(d, 19, 28), bit(d, 19, 29), bit(d, 19, 30), bit(d, 19, 31),
      bit(d, 20, 0), bit(d, 20, 1), bit(d, 20, 2), bit(d, 20, 3), bit(d, 20, 4), bit(d, 20, 5),
    ],
    Elite: (d) => [6, 7, 8, 9, 12, 13, 14].map((b) => bit(d, 20, b)),
  },
  Wilderness: {
    Easy: (d) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((b) => bit(d, 21, b)),
    Medium: (d) => [13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24].map((b) => bit(d, 21, b)),
    Hard: (d) => [
      bit(d, 21, 25), bit(d, 21, 26), bit(d, 21, 27), bit(d, 21, 28), bit(d, 21, 29), bit(d, 21, 30), bit(d, 21, 31),
      bit(d, 22, 0), bit(d, 22, 1), bit(d, 22, 2),
    ],
    Elite: (d) => [3, 5, 7, 8, 9, 10, 11].map((b) => bit(d, 22, b)),
  },
};

// Map repo region names -> our 12 diary ids (data.js DIARIES).
const REGION_TO_ID = {
  Falador: "falador",
  Ardougne: "ardougne",
  Kandarin: "kandarin",
  Morytania: "morytania",
  Karamja: "karamja",
  "Kourend & Kebos": "kourend",
  "Lumbridge & Draynor": "lumbridge",
  Fremennik: "fremennik",
  "Western Provinces": "western",
  Varrock: "varrock",
  Wilderness: "wilderness",
  Desert: "desert",
};

// Decode diary_vars into { ourDiaryId: "None"|"Easy"|"Medium"|"Hard"|"Elite" } —
// the highest fully-completed tier per diary. Never throws on short/garbage input.
export function decodeDiaries(diaryVars) {
  const dv = Array.isArray(diaryVars) ? diaryVars : [];
  const out = {};
  for (const [region, id] of Object.entries(REGION_TO_ID)) {
    const tiers = DIARY_VAR_LAYOUT[region];
    let highest = "None";
    for (const tier of TIER_ORDER) {
      let tasks;
      try {
        tasks = tiers[tier](dv);
      } catch {
        tasks = [];
      }
      if (tasks.length > 0 && tasks.every(Boolean)) highest = tier;
      else break; // stop at first incomplete tier
    }
    out[id] = highest;
  }
  return out;
}
