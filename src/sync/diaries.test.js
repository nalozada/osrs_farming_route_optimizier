import { describe, it, expect } from "vitest";
import { decodeDiaries } from "./diaries.js";
import { DIARY_TIERS } from "../data.js";

const zeros = () => new Array(62).fill(0);

describe("decodeDiaries", () => {
  it("returns None for everything on empty/garbage input without throwing", () => {
    for (const input of [zeros(), [], null, "x", undefined]) {
      const out = decodeDiaries(input);
      expect(Object.keys(out)).toHaveLength(12);
      expect(Object.values(out).every(t => t === "None")).toBe(true);
    }
  });

  it("decodes a varp-bitfield diary tier (Falador Easy) from a synthetic fixture", () => {
    // Falador Easy = bits 0..10 of index 4; set exactly those, leave Medium bits clear.
    const dv = zeros();
    dv[4] = 0b11111111111; // bits 0-10
    const out = decodeDiaries(dv);
    expect(out.falador).toBe("Easy");
    // nothing else completes
    expect(out.ardougne).toBe("None");
  });

  it("decodes the discrete-varbit Karamja Easy tier", () => {
    // Karamja Easy reads discrete values at 23..32 (two of them expect 5, rest 1).
    const dv = zeros();
    dv[23] = 5; dv[30] = 5;
    for (const i of [24, 25, 26, 27, 28, 29, 31, 32]) dv[i] = 1;
    const out = decodeDiaries(dv);
    expect(out.karamja).toBe("Easy");
  });

  it("always reports a valid tier value for all 12 diaries", () => {
    const out = decodeDiaries(zeros());
    const ids = ["falador","ardougne","kandarin","morytania","karamja","kourend","lumbridge","fremennik","western","varrock","wilderness","desert"];
    expect(Object.keys(out).sort()).toEqual([...ids].sort());
    expect(Object.values(out).every(t => DIARY_TIERS.includes(t))).toBe(true);
  });
});
