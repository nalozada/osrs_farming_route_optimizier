// Skill decoding for Group Ironman tracker data.
// The GIM plugin emits a fixed-length skills array of raw XP values. Farming is at
// index 19 in both the RuneLite Skill order and groupiron.men's array.
export const FARMING_SKILL_INDEX = 19;

// Cumulative minimum XP required to reach each level 1..99 (standard OSRS table).
// Computed from the canonical formula so we don't hand-maintain 99 constants.
const LEVEL_MIN_XP = (() => {
  const table = [0, 0]; // table[L] = min xp for level L; level 1 = 0 xp
  let points = 0;
  for (let lvl = 1; lvl < 99; lvl++) {
    points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
    table[lvl + 1] = Math.floor(points / 4);
  }
  return table; // table[99] === 13034431
})();

export function levelFromXp(xp) {
  const x = Number(xp);
  if (!Number.isFinite(x) || x <= 0) return 1;
  for (let L = 99; L >= 1; L--) {
    if (x >= LEVEL_MIN_XP[L]) return L;
  }
  return 1;
}

export function farmingLevelFromSkills(skills) {
  if (!Array.isArray(skills)) return 1;
  return levelFromXp(skills[FARMING_SKILL_INDEX]);
}
