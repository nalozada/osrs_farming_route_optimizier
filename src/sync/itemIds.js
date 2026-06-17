// itemIds.js
// OSRS farming seed/sapling -> numeric item id mapping, for bank-check feature.
//
// Source of truth: https://prices.runescape.wiki/api/v1/osrs/mapping ({id,name} for all
// tradeable items), cross-checked against individual oldschool.runescape.wiki item pages.
//
// Conventions:
//  - For tree, fruit-tree, and calquat: BOTH the planted sapling item id AND the raw
//    seed item id map to the SAME canonical sapling name, so owning either counts as
//    "have the planting material".
//  - For every other category: one item id -> the canonical seed name.
//
// IMPORTANT id notes (verified, see name->id table in the PR/commit message):
//  - "Bittercap mushroom spore": the actual OSRS item is named just "Mushroom spore"
//    (id 5282). It is planted in the mushroom patch and yields bittercap mushrooms.
//    There is NO item literally named "Bittercap mushroom spore".
//  - "Calquat seed": the actual OSRS raw seed item is named "Calquat tree seed"
//    (id 5290), not "Calquat seed". Per the tree/calquat rule, both it and the
//    "Calquat sapling" (id 5503) map to the canonical name "Calquat sapling".

/**
 * Maps OSRS numeric item id -> canonical seed/sapling name used by this app.
 * @type {Object<number, string>}
 */
export const SEED_ITEM_IDS = {
  // ---- HERB seeds ----
  5291: "Guam seed",
  5292: "Marrentill seed",
  5293: "Tarromin seed",
  5294: "Harralander seed",
  5295: "Ranarr seed",
  5296: "Toadflax seed",
  5297: "Irit seed",
  5298: "Avantoe seed",
  5299: "Kwuarm seed",
  5300: "Snapdragon seed",
  30088: "Huasca seed",
  5301: "Cadantine seed",
  5302: "Lantadyme seed",
  5303: "Dwarf weed seed",
  5304: "Torstol seed",

  // ---- ALLOTMENT seeds ----
  5318: "Potato seed",
  5319: "Onion seed",
  5324: "Cabbage seed",
  5322: "Tomato seed",
  5320: "Sweetcorn seed",
  5323: "Strawberry seed",
  5321: "Watermelon seed",
  22879: "Snape grass seed",

  // ---- FLOWER seeds ----
  5096: "Marigold seed",
  5097: "Rosemary seed",
  5098: "Nasturtium seed",
  5099: "Woad seed",
  5100: "Limpwurt seed",
  22887: "White lily seed",

  // ---- TREE: sapling id + raw seed id both -> sapling name ----
  5370: "Oak sapling",
  5312: "Oak sapling", // Acorn (raw seed)
  5371: "Willow sapling",
  5313: "Willow sapling", // Willow seed
  5372: "Maple sapling",
  5314: "Maple sapling", // Maple seed
  5373: "Yew sapling",
  5315: "Yew sapling", // Yew seed
  5374: "Magic sapling",
  5316: "Magic sapling", // Magic seed

  // ---- FRUIT TREE: sapling id + raw seed id both -> sapling name ----
  5496: "Apple sapling",
  5283: "Apple sapling", // Apple tree seed
  5497: "Banana sapling",
  5284: "Banana sapling", // Banana tree seed
  5498: "Orange sapling",
  5285: "Orange sapling", // Orange tree seed
  5499: "Curry sapling",
  5286: "Curry sapling", // Curry tree seed
  5500: "Pineapple sapling",
  5287: "Pineapple sapling", // Pineapple seed
  5501: "Papaya sapling",
  5288: "Papaya sapling", // Papaya tree seed
  5502: "Palm sapling",
  5289: "Palm sapling", // Palm tree seed
  22866: "Dragonfruit sapling",
  22877: "Dragonfruit sapling", // Dragonfruit tree seed

  // ---- BUSH seeds ----
  5101: "Redberry seed",
  5102: "Cadavaberry seed",
  5103: "Dwellberry seed",
  5104: "Jangerberry seed",
  5105: "Whiteberry seed",
  5106: "Poison ivy seed",

  // ---- HOPS seeds ----
  5305: "Barley seed",
  5307: "Hammerstone seed",
  5308: "Asgarnian seed",
  5306: "Jute seed",
  5309: "Yanillian seed",
  5310: "Krandorian seed",
  5311: "Wildblood seed",

  // ---- CACTUS ----
  5280: "Cactus seed",
  22873: "Potato cactus seed",

  // ---- CALQUAT: sapling id + raw seed id both -> sapling name ----
  5503: "Calquat sapling",
  5290: "Calquat sapling", // "Calquat tree seed" (real item name; user calls it "Calquat seed")

  // ---- SEAWEED ----
  21490: "Seaweed spore",

  // ---- MUSHROOM ----
  5282: "Bittercap mushroom spore", // real OSRS item name is "Mushroom spore"

  // ---- BELLADONNA ----
  5281: "Belladonna seed",
};

/**
 * Strips a trailing quantity suffix and trims whitespace.
 * Handles "Potato seed ×3", "Potato seed x 3", "Potato seed (3)".
 * @param {string} name
 * @returns {string}
 */
export function normalizeSeedName(name) {
  if (typeof name !== "string") return "";
  return name
    // "×N" (multiplication sign), optional surrounding spaces, end of string
    .replace(/\s*[×✕]\s*[\d,]+\s*$/u, "")
    // "x N" / "xN" (ascii x), end of string. Requires a space before the x so we
    // don't chop a trailing literal "x" off a real word.
    .replace(/\s+x\s*[\d,]+\s*$/iu, "")
    // "(N)" at end of string
    .replace(/\s*\(\s*[\d,]+\s*\)\s*$/u, "")
    .trim();
}

/**
 * Given one or more flat [itemId, qty, itemId, qty, ...] arrays (e.g. bank,
 * inventory, seed vault), returns a Set of canonical seed/sapling names present
 * with qty > 0, resolved via SEED_ITEM_IDS.
 * @param {...Array<number|string>} arrays
 * @returns {Set<string>}
 */
export function ownedSeedNamesFromBank(...arrays) {
  const owned = new Set();
  for (const arr of arrays) {
    if (!Array.isArray(arr)) continue;
    for (let i = 0; i + 1 < arr.length; i += 2) {
      const id = Number(arr[i]);
      const qty = Number(arr[i + 1]);
      if (!Number.isFinite(id) || !Number.isFinite(qty) || qty <= 0) continue;
      const name = SEED_ITEM_IDS[id];
      if (name) owned.add(name);
    }
  }
  return owned;
}
