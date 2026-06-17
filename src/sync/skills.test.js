import { describe, it, expect } from "vitest";
import { FARMING_SKILL_INDEX, levelFromXp, farmingLevelFromSkills } from "./skills.js";

describe("skills", () => {
  it("Farming is at index 19", () => {
    expect(FARMING_SKILL_INDEX).toBe(19);
  });

  it("levelFromXp matches the OSRS table at boundaries", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(82)).toBe(1);
    expect(levelFromXp(83)).toBe(2); // level 2 starts at 83 xp
    expect(levelFromXp(13034431)).toBe(99);
    expect(levelFromXp(200000000)).toBe(99); // max-xp clamps to 99
    expect(levelFromXp(2142721)).toBe(80); // the real sample (Fentf0ld farming)
  });

  it("farmingLevelFromSkills reads index 19, defends against bad input", () => {
    const skills = new Array(24).fill(0);
    skills[19] = 2142721;
    expect(farmingLevelFromSkills(skills)).toBe(80);
    expect(farmingLevelFromSkills(null)).toBe(1);
    expect(farmingLevelFromSkills([])).toBe(1);
  });
});
