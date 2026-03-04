import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// OSRS FARMING ROUTE OPTIMIZER v3
// Speed: 1=Instant (at patch), 2=Fast (<30 tiles), 3=Medium (30-60s),
//        4=Slow (60s+ or multi-step), 5=Very Slow (city TP + long run)
// ═══════════════════════════════════════════════════════════════

const QUESTS = [
  { id: "myArm", name: "My Arm's Big Adventure" },
  { id: "makingFriends", name: "Making Friends with My Arm" },
  { id: "songOfElves", name: "Song of the Elves" },
  { id: "boneVoyage", name: "Bone Voyage" },
  { id: "ghostsAhoy", name: "Ghosts Ahoy" },
  { id: "fairyTaleII", name: "Fairy Tale II (started)" },
  { id: "royalTrouble", name: "Royal Trouble" },
  { id: "monkeyMadnessII", name: "Monkey Madness II" },
  { id: "dragonSlayerII", name: "Dragon Slayer II" },
  { id: "mourningsEndII", name: "Mourning's End Part II" },
  { id: "regicide", name: "Regicide" },
  { id: "cabinFever", name: "Cabin Fever" },
  { id: "rumDeal", name: "Rum Deal" },
  { id: "theGreatBrainRobbery", name: "The Great Brain Robbery" },
  { id: "deathOnTheIsle", name: "Death on the Isle" },
  { id: "childrenOfTheSun", name: "Children of the Sun" },
  { id: "desertTreasureII", name: "Desert Treasure II" },
  { id: "thePath", name: "The Path of Glouphrie" },
  { id: "aKingdomDivided", name: "A Kingdom Divided" },
];

const DIARIES = [
  { id: "falador", name: "Falador Diary" },
  { id: "ardougne", name: "Ardougne Diary" },
  { id: "kandarin", name: "Kandarin Diary" },
  { id: "morytania", name: "Morytania Diary" },
  { id: "karamja", name: "Karamja Diary" },
  { id: "kourend", name: "Kourend & Kebos Diary" },
  { id: "lumbridge", name: "Lumbridge & Draynor Diary" },
  { id: "fremennik", name: "Fremennik Diary" },
  { id: "western", name: "Western Provinces Diary" },
  { id: "varrock", name: "Varrock Diary" },
  { id: "wilderness", name: "Wilderness Diary" },
  { id: "desert", name: "Desert Diary" },
];
const DIARY_TIERS = ["None", "Easy", "Medium", "Hard", "Elite"];

// Spirit trees split: base network (always-available destinations) vs planted
const TELEPORTS = [
  { id: "explorerRing", name: "Explorer's Ring 2+", cat: "diary" },
  { id: "ardougneCloak", name: "Ardougne Cloak 2+", cat: "diary" },
  { id: "ectophial", name: "Ectophial", cat: "quest" },
  { id: "spiritTree", name: "Spirit Trees (base network)", cat: "transport",
    desc: "TP to Varrock GE first, then use network: Gnome Stronghold, TGV, Khazard Battlefield" },
  { id: "spiritTreeFarmingGuild", name: "Spirit Tree: Farming Guild (planted)", cat: "planted",
    desc: "Requires 83 Farming + spirit tree planted" },
  { id: "spiritTreePrif", name: "Spirit Tree: Prifddinas", cat: "planted",
    desc: "Available after Song of the Elves" },
  { id: "spiritTreePortSarim", name: "Spirit Tree: Port Sarim (planted)", cat: "planted",
    desc: "Requires 83 Farming + spirit tree planted" },
  { id: "spiritTreeHosidius", name: "Spirit Tree: Hosidius (planted)", cat: "planted",
    desc: "Requires 83 Farming + spirit tree planted" },
  { id: "spiritTreeEtceteria", name: "Spirit Tree: Etceteria (planted)", cat: "planted",
    desc: "Requires 83 Farming + spirit tree planted" },
  { id: "spiritTreeBrimhaven", name: "Spirit Tree: Brimhaven (planted)", cat: "planted",
    desc: "Requires 83 Farming + spirit tree planted" },
  { id: "fairyRing", name: "Fairy Rings", cat: "transport" },
  { id: "xericTalisman", name: "Xeric's Talisman", cat: "item" },
  { id: "royalSeedPod", name: "Royal Seed Pod", cat: "item" },
  { id: "skillsNecklace", name: "Skills Necklace", cat: "jewellery" },
  { id: "combatBracelet", name: "Combat Bracelet", cat: "jewellery" },
  { id: "gamesNecklace", name: "Games Necklace", cat: "jewellery" },
  { id: "ringOfWealth", name: "Ring of Wealth", cat: "jewellery" },
  { id: "amuletOfGlory", name: "Amulet of Glory", cat: "jewellery" },
  { id: "necklaceOfPassage", name: "Necklace of Passage", cat: "jewellery" },
  { id: "slayerRing", name: "Slayer Ring", cat: "jewellery" },
  { id: "teleportCrystal", name: "Teleport Crystal", cat: "item" },
  { id: "lunarSpellbook", name: "Lunar Spellbook", cat: "spellbook" },
  { id: "ancientSpellbook", name: "Ancient Spellbook", cat: "spellbook" },
  // Standard Spellbook is always available to all accounts — not toggleable
  { id: "stonyBasalt", name: "Stony Basalt", cat: "item" },
  { id: "icyBasalt", name: "Icy Basalt", cat: "item" },
  { id: "farmingCape", name: "Farming Cape (99)", cat: "item" },
  { id: "quetzalWhistle", name: "Quetzal Whistle", cat: "item" },
  { id: "kharedstsMemoirs", name: "Kharedst's Memoirs / Book of the Dead", cat: "item" },
  { id: "pendantOfAtes", name: "Pendant of Ates", cat: "item" },
  { id: "ringOfElements", name: "Ring of the Elements", cat: "jewellery" },
  { id: "questPointCape", name: "Quest Point Cape", cat: "item" },
];

const OTHER_UNLOCKS = [
  { id: "farmingGuild45", name: "Farming Guild Beginner (45 Farming)" },
  { id: "farmingGuild", name: "Farming Guild Intermediate (65 Farming)" },
  { id: "farmingGuild85", name: "Farming Guild Advanced (85 Farming)" },
  { id: "prifAccess", name: "Prifddinas Access" },
  { id: "fossilIsland", name: "Fossil Island Access" },
  { id: "harmonyIsland", name: "Harmony Island Access" },
  { id: "varlamoreAccess", name: "Varlamore Access" },
  { id: "kastoriQuetzal", name: "Quetzal landing site at Kastori" },
];

// ═══════════════════════════════════════════════════════════════
// PATCH DATA
// proximityGroup: patches sharing a proximityGroup are merged
// into one stop even if not exactly co-located. This handles:
//   - Gnome Stronghold tree + fruit tree (short walk apart)
//   - Catherby herb/allotment + fruit tree (along same coastline)
//   - All Farming Guild tiers (same area)
// ═══════════════════════════════════════════════════════════════

const PATCHES = [
  // ═══ HERB PATCHES ═══
  { id: "herb_falador", name: "Falador (South)", type: "herb",
    proximityGroup: "falador_south", region: "Asgarnia", routePriority: 10,
    farmingItems: [{ name: "Seed", slots: 1 }, { name: "Seed dibber", slots: 1 }, { name: "Spade", slots: 1 }, { name: "Rake", slots: 1 }],
    teleports: [
      { method: "Explorer's Ring → Cabbage Patch", requires: { teleports: ["explorerRing"] }, speed: 1, items: ["Explorer's Ring 2+"] },
      { method: "Ring of the Elements → Air Altar, run south", requires: { teleports: ["ringOfElements"] }, speed: 2, items: ["Ring of the Elements"] },
      { method: "Spirit Tree → Port Sarim, run north", requires: { teleports: ["spiritTreePortSarim"] }, speed: 3, items: [] },
      { method: "Ring of Wealth → Falador Park, run south", requires: { teleports: ["ringOfWealth"] }, speed: 4, items: ["Ring of Wealth"] },
      { method: "Falador Teleport, run south", requires: { teleports: ["standardSpellbook"] }, speed: 5, items: ["Law rune", "Air runes", "Water rune"] },
    ], notes: "10% bonus XP w/ Medium Falador Diary." },
  { id: "herb_phasmatys", name: "Port Phasmatys", type: "herb",
    proximityGroup: "port_phasmatys", region: "Morytania", routePriority: 20,
    farmingItems: [{ name: "Seed", slots: 1 }],
    teleports: [
      { method: "Ectophial teleport", requires: { teleports: ["ectophial"] }, speed: 1, items: ["Ectophial"] },
      { method: "Fairy Ring ALQ", requires: { teleports: ["fairyRing"] }, speed: 3, items: ["Dramen/Lunar staff"] },
    ], notes: null },
  { id: "herb_catherby", name: "Catherby", type: "herb",
    proximityGroup: "catherby_area", region: "Kandarin", routePriority: 30,
    farmingItems: [{ name: "Seed", slots: 1 }],
    teleports: [
      { method: "Catherby Teleport (Lunar)", requires: { teleports: ["lunarSpellbook"] }, speed: 1, items: ["Runes (Lunar)"] },
      { method: "Camelot Teleport, run east", requires: { teleports: ["standardSpellbook"] }, speed: 3, items: ["Law rune", "Air runes"] },
    ], notes: "5/10/15% extra herb yield w/ Med/Hard/Elite Kandarin Diary." },
  { id: "herb_ardougne", name: "Ardougne (North)", type: "herb",
    proximityGroup: "ardougne_north", region: "Kandarin", routePriority: 25,
    farmingItems: [{ name: "Seed", slots: 1 }],
    teleports: [
      { method: "Ardougne Cloak 2+ → Farming patch", requires: { teleports: ["ardougneCloak"] }, speed: 1, items: ["Ardougne Cloak 2+"] },
      { method: "Skills Necklace → Fishing Guild, run north", requires: { teleports: ["skillsNecklace"] }, speed: 2, items: ["Skills Necklace"] },
      { method: "Quest Point Cape teleport", requires: { teleports: ["questPointCape"] }, speed: 3, items: ["Quest Point Cape"] },
      { method: "Fairy Ring BLR", requires: { teleports: ["fairyRing"] }, speed: 4, items: ["Dramen/Lunar staff"] },
      { method: "Ardougne Teleport, run north", requires: { teleports: ["standardSpellbook"] }, speed: 5, items: ["Law rune", "Water runes"] },
    ], notes: null },
  { id: "herb_hosidius", name: "Hosidius", type: "herb",
    proximityGroup: "hosidius", region: "Kourend", routePriority: 35,
    farmingItems: [{ name: "Seed", slots: 1 }],
    teleports: [
      { method: "Xeric's Talisman → Xeric's Glade", requires: { teleports: ["xericTalisman"] }, speed: 1, items: ["Xeric's Talisman"] },
      { method: "Memoirs/Book of the Dead → Lancalliums", requires: { teleports: ["kharedstsMemoirs"] }, speed: 2, items: ["Memoirs/Book of the Dead"] },
      { method: "Spirit Tree → Hosidius (45 Agi shortcut)", requires: { teleports: ["spiritTreeHosidius"] }, speed: 3, items: [] },
      { method: "Fairy Ring AKR → Vinery, run west", requires: { teleports: ["fairyRing"] }, speed: 4, items: ["Dramen/Lunar staff"] },
    ], notes: "Disease-free w/ Easy Kourend Diary. +5% yield w/ Hard." },
  { id: "herb_trollStronghold", name: "Troll Stronghold", type: "herb",
    proximityGroup: "troll_stronghold", region: "Asgarnia", routePriority: 15,
    farmingItems: [{ name: "Seed", slots: 1 }],
    teleports: [
      { method: "Stony Basalt teleport", requires: { teleports: ["stonyBasalt"], quests: ["makingFriends"] }, speed: 1, items: ["Stony Basalt"] },
      { method: "Trollheim Teleport, run west", requires: { teleports: ["standardSpellbook"], quests: ["myArm"] }, speed: 3, items: ["Law rune", "Fire runes"] },
    ], requirements: { quests: ["myArm"] },
    notes: "Disease-free. Req: My Arm's Big Adventure." },
  { id: "herb_weiss", name: "Weiss", type: "herb",
    proximityGroup: "weiss", region: "Fremennik", routePriority: 12,
    farmingItems: [{ name: "Seed", slots: 1 }],
    teleports: [
      { method: "Icy Basalt teleport", requires: { teleports: ["icyBasalt"] }, speed: 1, items: ["Icy Basalt"] },
      { method: "Fairy Ring DKS → Larry's boat, long run", requires: { teleports: ["fairyRing"] }, speed: 4, items: ["Dramen/Lunar staff"] },
    ], requirements: { quests: ["makingFriends"] },
    notes: "Disease-free. Req: Making Friends with My Arm." },
  { id: "herb_harmony", name: "Harmony Island", type: "herb",
    proximityGroup: "harmony_herb", region: "Morytania", routePriority: 50,
    farmingItems: [{ name: "Seed", slots: 1 }],
    teleports: [
      { method: "Harmony Island Teleport (Arceuus)", requires: { teleports: ["ancientSpellbook"] }, speed: 2, items: ["Runes (Arceuus)"] },
      { method: "Ectophial → docks → boat", requires: { teleports: ["ectophial"] }, speed: 5, items: ["Ectophial"] },
    ], requirements: { diaries: { morytania: "Elite" }, unlocks: ["harmonyIsland"] },
    notes: "Disease-free. Req: Elite Morytania Diary." },
  { id: "herb_farmingGuild", name: "Farming Guild", type: "herb",
    proximityGroup: "farming_guild", region: "Kourend", routePriority: 5,
    farmingItems: [{ name: "Seed", slots: 1 }],
    teleports: [
      { method: "Farming Cape teleport", requires: { teleports: ["farmingCape"] }, speed: 1, items: ["Farming Cape"] },
      { method: "Skills Necklace → Farming Guild", requires: { teleports: ["skillsNecklace"] }, speed: 1, items: ["Skills Necklace"] },
      { method: "Spirit Tree → Farming Guild", requires: { teleports: ["spiritTreeFarmingGuild"] }, speed: 2, items: [] },
      { method: "Fairy Ring CIR, run SW", requires: { teleports: ["fairyRing"] }, speed: 3, items: ["Dramen/Lunar staff"] },
    ], requirements: { unlocks: ["farmingGuild"] },
    notes: "+5% yield w/ Hard Kourend Diary. Req: 65 Farming." },
  { id: "herb_varlamore", name: "Civitas illa Fortis", type: "herb",
    proximityGroup: "civitas", region: "Varlamore", routePriority: 40,
    farmingItems: [{ name: "Seed", slots: 1 }],
    teleports: [
      { method: "Quetzal Whistle → Hunter Guild, run north", requires: { teleports: ["quetzalWhistle"] }, speed: 2, items: ["Quetzal Whistle"] },
      { method: "Fairy Ring AJP, run NW", requires: { teleports: ["fairyRing"] }, speed: 3, items: ["Dramen/Lunar staff"] },
    ], requirements: { unlocks: ["varlamoreAccess"] },
    notes: "Disease-free at Champion rank." },

  // ═══ ALLOTMENT PATCHES ═══
  { id: "allot_falador", name: "Falador (South)", type: "allotment",
    proximityGroup: "falador_south", region: "Asgarnia", routePriority: 10,
    farmingItems: [{ name: "Seeds ×3", slots: 1 }, { name: "Compost", slots: 1 }],
    teleports: [
      { method: "Explorer's Ring → Cabbage Patch", requires: { teleports: ["explorerRing"] }, speed: 1, items: ["Explorer's Ring 2+"] },
      { method: "Falador Teleport, run south", requires: { teleports: ["standardSpellbook"] }, speed: 5, items: ["Law rune", "Air runes", "Water rune"] },
    ], notes: null },
  { id: "allot_phasmatys", name: "Port Phasmatys", type: "allotment",
    proximityGroup: "port_phasmatys", region: "Morytania", routePriority: 20,
    farmingItems: [{ name: "Seeds ×3", slots: 1 }, { name: "Compost", slots: 1 }],
    teleports: [
      { method: "Ectophial teleport", requires: { teleports: ["ectophial"] }, speed: 1, items: ["Ectophial"] },
      { method: "Fairy Ring ALQ", requires: { teleports: ["fairyRing"] }, speed: 3, items: ["Dramen/Lunar staff"] },
    ], notes: null },
  { id: "allot_catherby", name: "Catherby", type: "allotment",
    proximityGroup: "catherby_area", region: "Kandarin", routePriority: 30,
    farmingItems: [{ name: "Seeds ×3", slots: 1 }, { name: "Compost", slots: 1 }],
    teleports: [
      { method: "Catherby Teleport (Lunar)", requires: { teleports: ["lunarSpellbook"] }, speed: 1, items: ["Runes (Lunar)"] },
      { method: "Camelot Teleport, run east", requires: { teleports: ["standardSpellbook"] }, speed: 3, items: ["Law rune", "Air runes"] },
    ], notes: null },
  { id: "allot_ardougne", name: "Ardougne (North)", type: "allotment",
    proximityGroup: "ardougne_north", region: "Kandarin", routePriority: 25,
    farmingItems: [{ name: "Seeds ×3", slots: 1 }, { name: "Compost", slots: 1 }],
    teleports: [
      { method: "Ardougne Cloak 2+ → Farming patch", requires: { teleports: ["ardougneCloak"] }, speed: 1, items: ["Ardougne Cloak 2+"] },
      { method: "Skills Necklace → Fishing Guild", requires: { teleports: ["skillsNecklace"] }, speed: 2, items: ["Skills Necklace"] },
    ], notes: null },
  { id: "allot_hosidius", name: "Hosidius", type: "allotment",
    proximityGroup: "hosidius", region: "Kourend", routePriority: 35,
    farmingItems: [{ name: "Seeds ×3", slots: 1 }, { name: "Compost", slots: 1 }],
    teleports: [
      { method: "Xeric's Talisman → Xeric's Glade", requires: { teleports: ["xericTalisman"] }, speed: 1, items: ["Xeric's Talisman"] },
    ], notes: "Disease-free w/ Easy Kourend Diary." },
  { id: "allot_farmingGuild", name: "Farming Guild", type: "allotment",
    proximityGroup: "farming_guild", region: "Kourend", routePriority: 5,
    farmingItems: [{ name: "Seeds ×3", slots: 1 }, { name: "Compost", slots: 1 }],
    teleports: [
      { method: "Skills Necklace → Farming Guild", requires: { teleports: ["skillsNecklace"] }, speed: 1, items: ["Skills Necklace"] },
      { method: "Farming Cape teleport", requires: { teleports: ["farmingCape"] }, speed: 1, items: ["Farming Cape"] },
    ], requirements: { unlocks: ["farmingGuild45"] }, notes: null },
  { id: "allot_prif", name: "Prifddinas", type: "allotment",
    proximityGroup: "prifddinas", region: "Tirannwn", routePriority: 18,
    farmingItems: [{ name: "Seeds ×3", slots: 1 }, { name: "Compost", slots: 1 }],
    teleports: [
      { method: "Spirit Tree → Prifddinas", requires: { teleports: ["spiritTreePrif"] }, speed: 1, items: [] },
      { method: "Teleport Crystal → Prifddinas", requires: { teleports: ["teleportCrystal"] }, speed: 2, items: ["Teleport Crystal"] },
    ], requirements: { quests: ["songOfElves"], unlocks: ["prifAccess"] },
    notes: "Allotment + flower only — no herb patch." },
  { id: "allot_harmony", name: "Harmony Island", type: "allotment",
    proximityGroup: "harmony_allot", region: "Morytania", routePriority: 50,
    farmingItems: [{ name: "Seeds ×3", slots: 1 }],
    teleports: [
      { method: "Harmony Island Teleport (Arceuus)", requires: { teleports: ["ancientSpellbook"] }, speed: 2, items: ["Runes (Arceuus)"] },
      { method: "Ectophial → boat", requires: { teleports: ["ectophial"] }, speed: 5, items: ["Ectophial"] },
    ], requirements: { unlocks: ["harmonyIsland"] },
    notes: "Single allotment only." },
  { id: "allot_varlamore", name: "Civitas illa Fortis", type: "allotment",
    proximityGroup: "civitas", region: "Varlamore", routePriority: 40,
    farmingItems: [{ name: "Seeds ×3", slots: 1 }, { name: "Compost", slots: 1 }],
    teleports: [
      { method: "Quetzal Whistle → Hunter Guild, run N", requires: { teleports: ["quetzalWhistle"] }, speed: 2, items: ["Quetzal Whistle"] },
      { method: "Fairy Ring AJP, run NW", requires: { teleports: ["fairyRing"] }, speed: 3, items: ["Dramen/Lunar staff"] },
    ], requirements: { unlocks: ["varlamoreAccess"] }, notes: null },

  // ═══ FLOWER PATCHES ═══
  { id: "flower_falador", name: "Falador (South)", type: "flower", proximityGroup: "falador_south", region: "Asgarnia", routePriority: 10, farmingItems: [{ name: "Flower seed", slots: 1 }], teleports: [{ method: "Explorer's Ring → Cabbage Patch", requires: { teleports: ["explorerRing"] }, speed: 1, items: ["Explorer's Ring 2+"] }], notes: null },
  { id: "flower_phasmatys", name: "Port Phasmatys", type: "flower", proximityGroup: "port_phasmatys", region: "Morytania", routePriority: 20, farmingItems: [{ name: "Flower seed", slots: 1 }], teleports: [{ method: "Ectophial", requires: { teleports: ["ectophial"] }, speed: 1, items: ["Ectophial"] }], notes: null },
  { id: "flower_catherby", name: "Catherby", type: "flower", proximityGroup: "catherby_area", region: "Kandarin", routePriority: 30, farmingItems: [{ name: "Flower seed", slots: 1 }], teleports: [{ method: "Catherby Teleport (Lunar)", requires: { teleports: ["lunarSpellbook"] }, speed: 1, items: ["Runes (Lunar)"] }], notes: null },
  { id: "flower_ardougne", name: "Ardougne (North)", type: "flower", proximityGroup: "ardougne_north", region: "Kandarin", routePriority: 25, farmingItems: [{ name: "Flower seed", slots: 1 }], teleports: [{ method: "Ardougne Cloak 2+", requires: { teleports: ["ardougneCloak"] }, speed: 1, items: ["Ardougne Cloak 2+"] }], notes: null },
  { id: "flower_hosidius", name: "Hosidius", type: "flower", proximityGroup: "hosidius", region: "Kourend", routePriority: 35, farmingItems: [{ name: "Flower seed", slots: 1 }], teleports: [{ method: "Xeric's Talisman → Glade", requires: { teleports: ["xericTalisman"] }, speed: 1, items: ["Xeric's Talisman"] }], notes: null },
  { id: "flower_farmingGuild", name: "Farming Guild", type: "flower", proximityGroup: "farming_guild", region: "Kourend", routePriority: 5, farmingItems: [{ name: "Flower seed", slots: 1 }], teleports: [{ method: "Skills Necklace → FG", requires: { teleports: ["skillsNecklace"] }, speed: 1, items: ["Skills Necklace"] }], requirements: { unlocks: ["farmingGuild45"] }, notes: null },
  { id: "flower_prif", name: "Prifddinas", type: "flower", proximityGroup: "prifddinas", region: "Tirannwn", routePriority: 18, farmingItems: [{ name: "Flower seed", slots: 1 }], teleports: [{ method: "Spirit Tree → Prif", requires: { teleports: ["spiritTreePrif"] }, speed: 1, items: [] }, { method: "Teleport Crystal → Prif", requires: { teleports: ["teleportCrystal"] }, speed: 2, items: ["Teleport Crystal"] }], requirements: { quests: ["songOfElves"], unlocks: ["prifAccess"] }, notes: null },
  { id: "flower_varlamore", name: "Civitas illa Fortis", type: "flower", proximityGroup: "civitas", region: "Varlamore", routePriority: 40, farmingItems: [{ name: "Flower seed", slots: 1 }], teleports: [{ method: "Quetzal Whistle", requires: { teleports: ["quetzalWhistle"] }, speed: 2, items: ["Quetzal Whistle"] }], requirements: { unlocks: ["varlamoreAccess"] }, notes: null },

  // ═══ TREE PATCHES ═══
  { id: "tree_lumbridge", name: "Lumbridge", type: "tree",
    proximityGroup: "lumbridge_tree", region: "Misthalin", routePriority: 10,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Lumbridge Teleport", requires: { teleports: ["standardSpellbook"] }, speed: 1, items: ["Law rune", "Air rune", "Earth rune"] },
    ], notes: null },
  { id: "tree_varrock", name: "Varrock Castle", type: "tree",
    proximityGroup: "varrock_tree", region: "Misthalin", routePriority: 15,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Varrock Teleport", requires: { teleports: ["standardSpellbook"] }, speed: 1, items: ["Law rune", "Air rune", "Fire rune"] },
      { method: "Spirit Tree → GE, run south", requires: { teleports: ["spiritTree"] }, speed: 2, items: [] },
      { method: "Ring of Wealth → GE", requires: { teleports: ["ringOfWealth"] }, speed: 2, items: ["Ring of Wealth"] },
    ], notes: null },
  { id: "tree_faladorPark", name: "Falador Park", type: "tree",
    proximityGroup: "falador_park_tree", region: "Asgarnia", routePriority: 20,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Ring of Wealth → Falador Park", requires: { teleports: ["ringOfWealth"] }, speed: 1, items: ["Ring of Wealth"] },
      { method: "Falador Teleport, run east", requires: { teleports: ["standardSpellbook"] }, speed: 2, items: ["Law rune", "Air runes", "Water rune"] },
    ], notes: "Disease-free w/ Elite Falador Diary." },
  { id: "tree_taverley", name: "Taverley", type: "tree",
    proximityGroup: "taverley_tree", region: "Asgarnia", routePriority: 25,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Falador Teleport, run NW through gate", requires: { teleports: ["standardSpellbook"] }, speed: 2, items: ["Law rune", "Air runes", "Water rune"] },
      { method: "Games Necklace → Burthorpe, run south", requires: { teleports: ["gamesNecklace"] }, speed: 3, items: ["Games Necklace"] },
    ], notes: null },
  { id: "tree_gnomeStronghold", name: "Gnome Stronghold", type: "tree",
    proximityGroup: "gnome_stronghold", region: "Kandarin", routePriority: 30,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Spirit Tree (via GE) → Gnome Stronghold", requires: { teleports: ["spiritTree"] }, speed: 1, items: [] },
      { method: "Slayer Ring → Stronghold Slayer Cave", requires: { teleports: ["slayerRing"] }, speed: 1, items: ["Slayer Ring"] },
      { method: "Royal Seed Pod", requires: { teleports: ["royalSeedPod"] }, speed: 1, items: ["Royal Seed Pod"] },
      { method: "Necklace of Passage → Outpost, run NE", requires: { teleports: ["necklaceOfPassage"] }, speed: 3, items: ["Necklace of Passage"] },
    ], notes: null },
  { id: "tree_farmingGuild", name: "Farming Guild", type: "tree",
    proximityGroup: "farming_guild", region: "Kourend", routePriority: 5,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Skills Necklace → Farming Guild", requires: { teleports: ["skillsNecklace"] }, speed: 1, items: ["Skills Necklace"] },
      { method: "Farming Cape teleport", requires: { teleports: ["farmingCape"] }, speed: 1, items: ["Farming Cape"] },
    ], requirements: { unlocks: ["farmingGuild"] }, notes: "Req: 65 Farming." },
  { id: "tree_auburnvale", name: "Auburnvale", type: "tree",
    proximityGroup: "auburnvale_tree", region: "Varlamore", routePriority: 35,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Quetzal Whistle → Varlamore, run east", requires: { teleports: ["quetzalWhistle"] }, speed: 2, items: ["Quetzal Whistle"] },
    ], requirements: { quests: ["childrenOfTheSun"], unlocks: ["varlamoreAccess"] },
    notes: "Req: Children of the Sun." },

  // ═══ FRUIT TREE PATCHES ═══
  // Gnome Stronghold fruit tree shares proximityGroup with tree patch
  { id: "fruit_gnomeStronghold", name: "Gnome Stronghold", type: "fruitTree",
    proximityGroup: "gnome_stronghold", region: "Kandarin", routePriority: 10,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Spirit Tree (via GE) → Gnome Stronghold", requires: { teleports: ["spiritTree"] }, speed: 1, items: [] },
      { method: "Royal Seed Pod", requires: { teleports: ["royalSeedPod"] }, speed: 1, items: ["Royal Seed Pod"] },
      { method: "Slayer Ring → Stronghold Slayer Cave", requires: { teleports: ["slayerRing"] }, speed: 1, items: ["Slayer Ring"] },
    ], notes: null },
  // Catherby fruit tree shares proximityGroup with herb/allot
  { id: "fruit_catherby", name: "Catherby", type: "fruitTree",
    proximityGroup: "catherby_area", region: "Kandarin", routePriority: 20,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Catherby Teleport (Lunar)", requires: { teleports: ["lunarSpellbook"] }, speed: 1, items: ["Runes (Lunar)"] },
      { method: "Camelot Teleport, run east", requires: { teleports: ["standardSpellbook"] }, speed: 3, items: ["Law rune", "Air runes"] },
    ], notes: null },
  { id: "fruit_treeGnomeVillage", name: "Tree Gnome Village", type: "fruitTree",
    proximityGroup: "gnome_village", region: "Kandarin", routePriority: 25,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Spirit Tree → TGV, follow Elkoy out", requires: { teleports: ["spiritTree"] }, speed: 2, items: [] },
      { method: "Fairy Ring CIQ", requires: { teleports: ["fairyRing"] }, speed: 3, items: ["Dramen/Lunar staff"] },
    ], notes: null },
  { id: "fruit_brimhaven", name: "Brimhaven", type: "fruitTree",
    proximityGroup: "brimhaven", region: "Karamja", routePriority: 30,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Spirit Tree → Brimhaven (planted)", requires: { teleports: ["spiritTreeBrimhaven"] }, speed: 1, items: [] },
      { method: "Charter ship from Catherby (if already there)", requires: {}, speed: 2, items: ["Coins (charter fee)"], charterFromCatherby: true },
      { method: "Amulet of Glory → Karamja, walk west", requires: { teleports: ["amuletOfGlory"] }, speed: 3, items: ["Amulet of Glory"] },
      { method: "Fairy Ring BJR", requires: { teleports: ["fairyRing"] }, speed: 4, items: ["Dramen/Lunar staff"] },
    ], notes: null },
  { id: "fruit_lletya", name: "Lletya", type: "fruitTree",
    proximityGroup: "lletya", region: "Tirannwn", routePriority: 35,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Teleport Crystal → Lletya", requires: { teleports: ["teleportCrystal"] }, speed: 1, items: ["Teleport Crystal"] },
    ], requirements: { quests: ["regicide"] }, notes: "Req: Regicide." },
  { id: "fruit_farmingGuild", name: "Farming Guild", type: "fruitTree",
    proximityGroup: "farming_guild", region: "Kourend", routePriority: 5,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Skills Necklace → Farming Guild", requires: { teleports: ["skillsNecklace"] }, speed: 1, items: ["Skills Necklace"] },
      { method: "Farming Cape teleport", requires: { teleports: ["farmingCape"] }, speed: 1, items: ["Farming Cape"] },
    ], requirements: { unlocks: ["farmingGuild85"] }, notes: "Req: 85 Farming." },
  { id: "fruit_kastori", name: "Kastori", type: "fruitTree",
    proximityGroup: "kastori_fruit", region: "Varlamore", routePriority: 32,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Quetzal Whistle → Kastori (landing site built)", requires: { teleports: ["quetzalWhistle"], unlocks: ["kastoriQuetzal"] }, speed: 1, items: ["Quetzal Whistle"] },
      { method: "Quetzal Whistle → Hunter Guild, run SE", requires: { teleports: ["quetzalWhistle"] }, speed: 3, items: ["Quetzal Whistle"] },
    ], requirements: { quests: ["childrenOfTheSun"], unlocks: ["varlamoreAccess"] },
    notes: "Req: Children of the Sun." },

  // ═══ BUSH PATCHES ═══
  { id: "bush_champions", name: "Champions' Guild", type: "bush", proximityGroup: "champions", region: "Misthalin", routePriority: 10, farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }], teleports: [{ method: "Combat Bracelet → Champions' Guild", requires: { teleports: ["combatBracelet"] }, speed: 1, items: ["Combat Bracelet"] }, { method: "Varrock Teleport, run SW", requires: { teleports: ["standardSpellbook"] }, speed: 3, items: ["Law rune", "Air rune", "Fire rune"] }], notes: null },
  { id: "bush_rimmington", name: "Rimmington", type: "bush", proximityGroup: "rimmington", region: "Asgarnia", routePriority: 15, farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }], teleports: [{ method: "Skills Necklace → Crafting Guild, run S", requires: { teleports: ["skillsNecklace"] }, speed: 2, items: ["Skills Necklace"] }], notes: null },
  { id: "bush_ardougne", name: "South Ardougne", type: "bush", proximityGroup: "ardougne_south_bush", region: "Kandarin", routePriority: 20, farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }], teleports: [{ method: "Ardougne Cloak 1+ → Monastery", requires: { teleports: ["ardougneCloak"] }, speed: 1, items: ["Ardougne Cloak 1+"] }, { method: "Fairy Ring DJP", requires: { teleports: ["fairyRing"] }, speed: 2, items: ["Dramen/Lunar staff"] }, { method: "Spirit Tree → Khazard Battlefield", requires: { teleports: ["spiritTree"] }, speed: 3, items: [] }], notes: null },
  { id: "bush_etceteria", name: "Etceteria", type: "bush", proximityGroup: "etceteria", region: "Fremennik", routePriority: 30, farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }], teleports: [{ method: "Spirit Tree → Etceteria (planted)", requires: { teleports: ["spiritTreeEtceteria"] }, speed: 1, items: [] }, { method: "Ring of Wealth → Miscellania", requires: { teleports: ["ringOfWealth"] }, speed: 2, items: ["Ring of Wealth"] }, { method: "Fairy Ring CIP", requires: { teleports: ["fairyRing"] }, speed: 3, items: ["Dramen/Lunar staff"] }], requirements: { quests: ["royalTrouble"] }, notes: null },
  { id: "bush_farmingGuild", name: "Farming Guild", type: "bush", proximityGroup: "farming_guild", region: "Kourend", routePriority: 5, farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }], teleports: [{ method: "Skills Necklace → FG", requires: { teleports: ["skillsNecklace"] }, speed: 1, items: ["Skills Necklace"] }], requirements: { unlocks: ["farmingGuild45"] }, notes: "Req: 45 Farming (east wing)." },

  // ═══ HOPS PATCHES ═══
  { id: "hops_lumbridge", name: "Lumbridge", type: "hops", proximityGroup: "lumbridge_hops", region: "Misthalin", routePriority: 10, farmingItems: [{ name: "Seeds ×4", slots: 1 }], teleports: [{ method: "Lumbridge Teleport, run N", requires: { teleports: ["standardSpellbook"] }, speed: 2, items: ["Law rune", "Air rune", "Earth rune"] }], notes: null },
  { id: "hops_seers", name: "McGrubor's Wood", type: "hops", proximityGroup: "seers_hops", region: "Kandarin", routePriority: 20, farmingItems: [{ name: "Seeds ×4", slots: 1 }], teleports: [{ method: "Combat Bracelet → Ranging Guild", requires: { teleports: ["combatBracelet"] }, speed: 2, items: ["Combat Bracelet"] }, { method: "Fairy Ring ALS", requires: { teleports: ["fairyRing"] }, speed: 2, items: ["Dramen/Lunar staff"] }], notes: null },
  { id: "hops_yanille", name: "Yanille", type: "hops", proximityGroup: "yanille_hops", region: "Kandarin", routePriority: 25, farmingItems: [{ name: "Seeds ×4", slots: 1 }], teleports: [{ method: "Watchtower TP → Yanille (Hard Ardy)", requires: { teleports: ["standardSpellbook"] }, speed: 2, items: ["Law rune", "Earth runes"] }, { method: "Fairy Ring CIQ", requires: { teleports: ["fairyRing"] }, speed: 3, items: ["Dramen/Lunar staff"] }], notes: null },
  { id: "hops_entrana", name: "Entrana", type: "hops", proximityGroup: "entrana_hops", region: "Asgarnia", routePriority: 40, farmingItems: [{ name: "Seeds ×4", slots: 1 }], teleports: [{ method: "Explorer's Ring → Port Sarim + boat", requires: { teleports: ["explorerRing"] }, speed: 3, items: ["Explorer's Ring 2+"] }], notes: "No weapons/armour on Entrana!" },

  // ═══ SPECIAL PATCHES ═══
  { id: "cactus_alkharid", name: "Al Kharid Cactus", type: "cactus", proximityGroup: "alkharid_cactus", region: "Desert", routePriority: 10, farmingItems: [{ name: "Cactus seed", slots: 1 }], teleports: [{ method: "Amulet of Glory → Al Kharid", requires: { teleports: ["amuletOfGlory"] }, speed: 2, items: ["Amulet of Glory"] }, { method: "Fairy Ring BIQ", requires: { teleports: ["fairyRing"] }, speed: 3, items: ["Dramen/Lunar staff"] }], notes: null },
  { id: "cactus_farmingGuild", name: "Farming Guild Cactus", type: "cactus", proximityGroup: "farming_guild", region: "Kourend", routePriority: 5, farmingItems: [{ name: "Cactus seed", slots: 1 }], teleports: [{ method: "Skills Necklace → FG", requires: { teleports: ["skillsNecklace"] }, speed: 1, items: ["Skills Necklace"] }], requirements: { unlocks: ["farmingGuild45"] }, notes: "Req: 45 Farming (east wing)." },
  { id: "calquat", name: "Calquat (Tai Bwo Wannai)", type: "calquat", proximityGroup: "calquat", region: "Karamja", routePriority: 10, farmingItems: [{ name: "Calquat sapling", slots: 1 }, { name: "Payment (8 poison ivy berries)", slots: 1 }], teleports: [{ method: "Fairy Ring CKR, run S", requires: { teleports: ["fairyRing"] }, speed: 2, items: ["Dramen/Lunar staff"] }, { method: "Glory → Karamja, run far S", requires: { teleports: ["amuletOfGlory"] }, speed: 4, items: ["Amulet of Glory"] }], notes: "Only calquat patch in-game." },
  { id: "seaweed", name: "Underwater Seaweed", type: "seaweed", proximityGroup: "seaweed", region: "Fossil Island", routePriority: 10, farmingItems: [{ name: "Seaweed spore ×2", slots: 1 }], teleports: [{ method: "Fairy Ring AKQ → dive spot", requires: { teleports: ["fairyRing"] }, speed: 2, items: ["Dramen/Lunar staff"] }], requirements: { quests: ["boneVoyage"], unlocks: ["fossilIsland"] }, notes: "Two patches. Req: Bone Voyage." },
  { id: "mushroom", name: "Canifis Mushroom", type: "mushroom", proximityGroup: "mushroom", region: "Morytania", routePriority: 10, farmingItems: [{ name: "Mushroom spore", slots: 1 }], teleports: [{ method: "Fairy Ring CKS, run N", requires: { teleports: ["fairyRing"] }, speed: 2, items: ["Dramen/Lunar staff"] }, { method: "Ectophial, run west", requires: { teleports: ["ectophial"] }, speed: 3, items: ["Ectophial"] }], notes: null },
  { id: "belladonna", name: "Draynor Belladonna", type: "belladonna", proximityGroup: "belladonna", region: "Misthalin", routePriority: 10, farmingItems: [{ name: "Belladonna seed", slots: 1 }], teleports: [{ method: "Glory → Draynor Village", requires: { teleports: ["amuletOfGlory"] }, speed: 1, items: ["Amulet of Glory"] }, { method: "Lumbridge TP, run west", requires: { teleports: ["standardSpellbook"] }, speed: 3, items: ["Law rune", "Air rune", "Earth rune"] }], notes: null },
];

const PATCH_TYPES = [
  { id: "herb", label: "Herb Patches", icon: "🌿", color: "#4CAF50" },
  { id: "allotment", label: "Allotments", icon: "🌾", color: "#FF9800" },
  { id: "tree", label: "Tree Patches", icon: "🌳", color: "#8B6914" },
  { id: "fruitTree", label: "Fruit Trees", icon: "🍎", color: "#E91E63" },
  { id: "bush", label: "Bush Patches", icon: "🫐", color: "#673AB7" },
  { id: "hops", label: "Hops Patches", icon: "🍺", color: "#FFC107" },
  { id: "flower", label: "Flower Patches", icon: "🌸", color: "#FF6090" },
  { id: "cactus", label: "Cactus", icon: "🌵", color: "#CDDC39" },
  { id: "calquat", label: "Calquat", icon: "🥥", color: "#795548" },
  { id: "seaweed", label: "Seaweed", icon: "🪸", color: "#009688" },
  { id: "mushroom", label: "Mushroom", icon: "🍄", color: "#9C27B0" },
  { id: "belladonna", label: "Belladonna", icon: "☠️", color: "#37474F" },
];

// ═══════════════════════════════════════════════════════════════
// CROP DATA — what can be planted in each patch type
// seed: what to withdraw from bank (per patch)
// payment: gardener protection payment (per patch), null = not protectable
// lvl: Farming level required
// ═══════════════════════════════════════════════════════════════
const CROPS = {
  herb: [
    { id: "guam", name: "Guam", seed: "Guam seed", lvl: 9 },
    { id: "marrentill", name: "Marrentill", seed: "Marrentill seed", lvl: 14 },
    { id: "tarromin", name: "Tarromin", seed: "Tarromin seed", lvl: 19 },
    { id: "harralander", name: "Harralander", seed: "Harralander seed", lvl: 26 },
    { id: "ranarr", name: "Ranarr", seed: "Ranarr seed", lvl: 32 },
    { id: "toadflax", name: "Toadflax", seed: "Toadflax seed", lvl: 38 },
    { id: "irit", name: "Irit", seed: "Irit seed", lvl: 44 },
    { id: "avantoe", name: "Avantoe", seed: "Avantoe seed", lvl: 50 },
    { id: "kwuarm", name: "Kwuarm", seed: "Kwuarm seed", lvl: 56 },
    { id: "snapdragon", name: "Snapdragon", seed: "Snapdragon seed", lvl: 62 },
    { id: "huasca", name: "Huasca", seed: "Huasca seed", lvl: 65 },
    { id: "cadantine", name: "Cadantine", seed: "Cadantine seed", lvl: 67 },
    { id: "lantadyme", name: "Lantadyme", seed: "Lantadyme seed", lvl: 73 },
    { id: "dwarfWeed", name: "Dwarf weed", seed: "Dwarf weed seed", lvl: 79 },
    { id: "torstol", name: "Torstol", seed: "Torstol seed", lvl: 85 },
  ],
  allotment: [
    { id: "potato", name: "Potato", seed: "Potato seed ×3", payment: "Compost ×2", lvl: 1 },
    { id: "onion", name: "Onion", seed: "Onion seed ×3", payment: "Potatoes(10) ×1", lvl: 5 },
    { id: "cabbage", name: "Cabbage", seed: "Cabbage seed ×3", payment: "Onions(10) ×1", lvl: 7 },
    { id: "tomato", name: "Tomato", seed: "Tomato seed ×3", payment: "Cabbages(10) ×2", lvl: 12 },
    { id: "sweetcorn", name: "Sweetcorn", seed: "Sweetcorn seed ×3", payment: "Jute fibre ×10", lvl: 20 },
    { id: "strawberry", name: "Strawberry", seed: "Strawberry seed ×3", payment: "Apples(5) ×1", lvl: 31 },
    { id: "watermelon", name: "Watermelon", seed: "Watermelon seed ×3", payment: "Curry leaf ×10", lvl: 47 },
    { id: "snapeGrass", name: "Snape grass", seed: "Snape grass seed ×3", payment: "Jangerberries ×5", lvl: 61 },
  ],
  flower: [
    { id: "marigold", name: "Marigold", seed: "Marigold seed", lvl: 2 },
    { id: "rosemary", name: "Rosemary", seed: "Rosemary seed", lvl: 11 },
    { id: "nasturtium", name: "Nasturtium", seed: "Nasturtium seed", lvl: 24 },
    { id: "woad", name: "Woad", seed: "Woad seed", lvl: 25 },
    { id: "limpwurt", name: "Limpwurt", seed: "Limpwurt seed", lvl: 26 },
    { id: "whileLily", name: "White lily", seed: "White lily seed", lvl: 58 },
  ],
  tree: [
    { id: "oak", name: "Oak", seed: "Oak sapling", payment: "Tomatoes(5) ×1", lvl: 15 },
    { id: "willow", name: "Willow", seed: "Willow sapling", payment: "Apples(5) ×1", lvl: 30 },
    { id: "maple", name: "Maple", seed: "Maple sapling", payment: "Oranges(5) ×1", lvl: 45 },
    { id: "yew", name: "Yew", seed: "Yew sapling", payment: "Cactus spine ×10", lvl: 60 },
    { id: "magic", name: "Magic", seed: "Magic sapling", payment: "Coconut ×25", lvl: 75 },
  ],
  fruitTree: [
    { id: "apple", name: "Apple", seed: "Apple sapling", payment: "Sweetcorn ×9", lvl: 27 },
    { id: "banana", name: "Banana", seed: "Banana sapling", payment: "Apples(5) ×4", lvl: 33 },
    { id: "orange", name: "Orange", seed: "Orange sapling", payment: "Strawberries(5) ×3", lvl: 39 },
    { id: "curry", name: "Curry", seed: "Curry sapling", payment: "Bananas(5) ×5", lvl: 42 },
    { id: "pineapple", name: "Pineapple", seed: "Pineapple sapling", payment: "Watermelon ×10", lvl: 51 },
    { id: "papaya", name: "Papaya", seed: "Papaya sapling", payment: "Pineapple ×10", lvl: 57 },
    { id: "palm", name: "Palm", seed: "Palm sapling", payment: "Papaya fruit ×15", lvl: 68 },
    { id: "dragonfruit", name: "Dragonfruit", seed: "Dragonfruit sapling", payment: "Coconut ×15", lvl: 81 },
  ],
  bush: [
    { id: "pick_only", name: "Pick only (no planting)", seed: null, payment: null, lvl: 1 },
    { id: "redberry", name: "Redberry", seed: "Redberry seed", payment: "Cabbages(10) ×4", lvl: 10 },
    { id: "cadavaberry", name: "Cadavaberry", seed: "Cadavaberry seed", payment: "Tomatoes(5) ×3", lvl: 22 },
    { id: "dwellberry", name: "Dwellberry", seed: "Dwellberry seed", payment: "Strawberries(5) ×3", lvl: 36 },
    { id: "jangerberry", name: "Jangerberry", seed: "Jangerberry seed", payment: "Watermelon ×6", lvl: 48 },
    { id: "whiteberry", name: "Whiteberry", seed: "Whiteberry seed", payment: "Mushroom ×8", lvl: 59 },
    { id: "poisonIvy", name: "Poison ivy", seed: "Poison ivy seed", payment: null, lvl: 70 },
  ],
  hops: [
    { id: "barley", name: "Barley", seed: "Barley seed ×4", payment: "Compost ×3", lvl: 3 },
    { id: "hammerstone", name: "Hammerstone", seed: "Hammerstone seed ×4", payment: "Marigold ×1", lvl: 4 },
    { id: "asgarnian", name: "Asgarnian", seed: "Asgarnian seed ×4", payment: "Onions(10) ×1", lvl: 8 },
    { id: "jute", name: "Jute", seed: "Jute seed ×3", payment: "Barley malt ×6", lvl: 13 },
    { id: "yanillian", name: "Yanillian", seed: "Yanillian seed ×4", payment: "Tomatoes(5) ×1", lvl: 16 },
    { id: "krandorian", name: "Krandorian", seed: "Krandorian seed ×4", payment: "Cabbages(10) ×3", lvl: 21 },
    { id: "wildblood", name: "Wildblood", seed: "Wildblood seed ×4", payment: "Nasturtium ×1", lvl: 28 },
  ],
  cactus: [
    { id: "pick_only", name: "Pick only (no planting)", seed: null, payment: null, lvl: 1 },
    { id: "cactus", name: "Cactus", seed: "Cactus seed", payment: "Cadava berries ×6", lvl: 55 },
    { id: "potatoCactus", name: "Potato cactus", seed: "Potato cactus seed", payment: "Snape grass ×8", lvl: 64 },
  ],
  calquat: [
    { id: "calquat", name: "Calquat", seed: "Calquat sapling", payment: "Poison ivy berries ×8", lvl: 72 },
  ],
  seaweed: [
    { id: "seaweed", name: "Giant seaweed", seed: "Seaweed spore", lvl: 23 },
  ],
  mushroom: [
    { id: "bittercap", name: "Bittercap", seed: "Bittercap mushroom spore", lvl: 53 },
  ],
  belladonna: [
    { id: "belladonna", name: "Belladonna", seed: "Belladonna seed", lvl: 63 },
  ],
};

// ═══════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════

const MAX_INVENTORY = 28;
const ALWAYS_EQUIPPED = 3; // spade, seed dibber, rake (take slots)

function meetsReqs(patch, prof) {
  const r = patch.requirements;
  if (!r) return true;
  if (r.quests) for (const q of r.quests) if (!prof.quests[q]) return false;
  if (r.diaries) for (const [d, t] of Object.entries(r.diaries)) if (DIARY_TIERS.indexOf(prof.diaries[d]||"None") < DIARY_TIERS.indexOf(t)) return false;
  if (r.unlocks) for (const u of r.unlocks) if (!prof.unlocks[u]) return false;
  return true;
}

function tpMeetsReqs(t, prof) {
  const r = t.requires;
  if (r.teleports) for (const tp of r.teleports) {
    if (tp === "standardSpellbook") continue; // always available
    if (!prof.teleports[tp]) return false;
  }
  if (r.quests) for (const q of r.quests) if (!prof.quests[q]) return false;
  if (r.unlocks) for (const u of r.unlocks) if (!prof.unlocks[u]) return false;
  if (r.diaries) for (const [d,t2] of Object.entries(r.diaries)) if (DIARY_TIERS.indexOf(prof.diaries[d]||"None") < DIARY_TIERS.indexOf(t2)) return false;
  return true;
}

function getBestTp(patch, prof) {
  const avail = patch.teleports.filter(t => tpMeetsReqs(t, prof)).sort((a,b) => a.speed - b.speed);
  return avail[0] || null;
}

function getBestUpgrade(patch, prof, curSpeed) {
  const unavail = patch.teleports.filter(t => !tpMeetsReqs(t, prof) && t.speed < curSpeed).sort((a,b) => a.speed - b.speed);
  if (!unavail.length) return null;
  const best = unavail[0];
  const missing = [];
  const r = best.requires;
  if (r.teleports) for (const tp of r.teleports) {
    if (tp === "standardSpellbook") continue; // always available
    if (!prof.teleports[tp]) { const d = TELEPORTS.find(t => t.id === tp); missing.push(d ? d.name : tp); }
  }
  if (r.quests) for (const q of r.quests) if (!prof.quests[q]) { const d = QUESTS.find(qu => qu.id === q); missing.push(d ? d.name : q); }
  if (r.unlocks) for (const u of r.unlocks) if (!prof.unlocks[u]) { const d = OTHER_UNLOCKS.find(o => o.id === u); missing.push(d ? d.name : u); }
  if (r.diaries) for (const [d,t] of Object.entries(r.diaries)) if (DIARY_TIERS.indexOf(prof.diaries[d]||"None") < DIARY_TIERS.indexOf(t)) { const dd = DIARIES.find(di => di.id === d); missing.push(`${t} ${dd ? dd.name : d}`); }
  return { method: best.method, speed: best.speed, missing };
}

function generateRoute(selectedTypes, prof, cropSelections) {
  const groups = {};
  const avail = PATCHES.filter(p => selectedTypes.includes(p.type) && meetsReqs(p, prof));

  for (const patch of avail) {
    const key = patch.proximityGroup;
    if (!groups[key]) groups[key] = { patches: [], name: patch.name, region: patch.region, key, bestSpeed: Infinity, bestTp: null, routePriority: patch.routePriority, notes: [] };
    const g = groups[key];
    g.patches.push(patch);
    const tp = getBestTp(patch, prof);
    if (tp && tp.speed < g.bestSpeed) { g.bestSpeed = tp.speed; g.bestTp = tp; }
    if (patch.routePriority < g.routePriority) g.routePriority = patch.routePriority;
    if (patch.notes) g.notes.push(patch.notes);
  }

  const stops = Object.values(groups).filter(g => g.bestTp).sort((a,b) => {
    if (a.bestSpeed !== b.bestSpeed) return a.bestSpeed - b.bestSpeed;
    return a.routePriority - b.routePriority;
  });

  // Check if Catherby is in the route (for charter-from-Catherby logic)
  const catherbyInRoute = stops.some(s => s.key === "catherby_area");

  // Build stops with inventory data using actual crop selections
  const rawSteps = stops.map((s, i) => {
    let bestUpgrade = null;
    for (const p of s.patches) {
      const u = getBestUpgrade(p, prof, s.bestSpeed);
      if (u && (!bestUpgrade || u.speed < bestUpgrade.speed)) bestUpgrade = u;
    }

    // If Brimhaven and Catherby are both in route, prefer charter if it's faster than current best
    let usedTp = s.bestTp;
    let usedSpeed = s.bestSpeed;
    if (s.key === "brimhaven" && catherbyInRoute) {
      const charterTp = s.patches[0]?.teleports.find(t => t.charterFromCatherby);
      if (charterTp && (!usedTp || charterTp.speed < usedSpeed || (usedTp && !usedTp.requires?.teleports?.length))) {
        // Only override if charter is faster or equal to current non-planted option
        const curNonPlanted = s.patches[0]?.teleports
          .filter(t => tpMeetsReqs(t, prof) && !t.charterFromCatherby)
          .sort((a,b) => a.speed - b.speed)[0];
        if (!curNonPlanted || charterTp.speed <= curNonPlanted.speed) {
          usedTp = charterTp;
          usedSpeed = charterTp.speed;
        }
      }
    }

    // Compute actual farming items from crop selections — track quantities
    const seedQty = {}; // { "Maple sapling": 3 }
    const paymentQty = {}; // { "Oranges(5) ×1": 3 }
    let farmingSlots = 0;
    let needsTreeRemovalCoins = false;

    for (const p of s.patches) {
      const cropList = CROPS[p.type];
      const selectedCrop = cropSelections[p.type];
      if (cropList && selectedCrop) {
        const crop = cropList.find(c => c.id === selectedCrop);
        if (crop) {
          // Pick-only mode: no seeds or payments needed
          if (crop.id === "pick_only") continue;

          const patchCount = p.type === "allotment" ? 2 : 1;
          if (crop.seed) {
            seedQty[crop.seed] = (seedQty[crop.seed] || 0) + patchCount;
          }
          if (crop.payment) {
            paymentQty[crop.payment] = (paymentQty[crop.payment] || 0) + patchCount;
          }

          // Trees and fruit trees need coins for farmer to chop down old tree
          if (p.type === "tree" || p.type === "fruitTree") {
            needsTreeRemovalCoins = true;
          }
        }
      } else {
        farmingSlots += 1;
      }
    }

    // Convert qty maps to labeled items with counts (for display at each stop)
    const seedItems = Object.entries(seedQty).map(([name, qty]) => qty > 1 ? `${name} ×${qty}` : name);
    const paymentItems = Object.entries(paymentQty).map(([name, qty]) => qty > 1 ? `${name} ×${qty} patches` : name);

    // Seeds stack (1 slot), each unique payment type is 1 noted slot
    farmingSlots += Object.keys(seedQty).length + Object.keys(paymentQty).length;

    // Add coins for tree removal if needed
    if (needsTreeRemovalCoins) {
      seedItems.push("Coins (200gp for tree removal)");
    }

    const teleportItems = [...new Set(usedTp.items || [])];
    const allFarmingItems = [...seedItems, ...paymentItems];

    return {
      location: s.name, region: s.region, key: s.key,
      patchTypes: [...new Set(s.patches.map(p => p.type))],
      teleport: usedTp.method, teleportSpeed: usedSpeed,
      teleportItems, farmingItems: allFarmingItems,
      seedItems, paymentItems,
      // Raw qty maps for bank aggregation
      seedQty: { ...seedQty }, paymentQty: { ...paymentQty },
      needsTreeRemovalCoins,
      farmingSlots,
      notes: [...new Set(s.notes)], upgrade: bestUpgrade,
    };
  });

  // Insert bank stops based on inventory capacity
  // ALWAYS start with an initial bank stop
  const withBanks = [];
  let currentLoad = ALWAYS_EQUIPPED; // spade, dibber, rake
  let currentSegmentItems = ["Spade", "Seed dibber", "Rake"];
  let segmentStops = [];

  // Compute the initial bank stop (what to bring for the first segment)
  const initialBank = computeBankWithdrawals(rawSteps, 0, []);
  withBanks.push({
    isBank: true,
    bankCategories: initialBank.categories,
    bankNote: initialBank.note,
    isInitial: true,
  });

  // Track what the initial bank loaded
  for (const cat of initialBank.categories) {
    for (const item of cat.items) {
      currentSegmentItems.push(item);
    }
  }
  currentLoad = initialBank.totalSlots;

  // Now figure out where mid-route banks are needed
  // We need to re-simulate since initial bank may not cover everything
  currentLoad = ALWAYS_EQUIPPED;
  currentSegmentItems = ["Spade", "Seed dibber", "Rake"];
  segmentStops = [];
  // Re-insert stops, adding bank stops as needed
  const stopsOnly = [];

  for (let i = 0; i < rawSteps.length; i++) {
    const step = rawSteps[i];
    const newTpItems = step.teleportItems.filter(it => !currentSegmentItems.includes(it));
    const stopSlots = newTpItems.length + step.farmingSlots;

    if (currentLoad + stopSlots > MAX_INVENTORY && segmentStops.length > 0) {
      const nextBank = computeBankWithdrawals(rawSteps, i, currentSegmentItems);
      stopsOnly.push({
        isBank: true,
        bankCategories: nextBank.categories,
        bankNote: nextBank.note,
        isInitial: false,
      });
      currentLoad = ALWAYS_EQUIPPED;
      currentSegmentItems = ["Spade", "Seed dibber", "Rake"];
      segmentStops = [];
    }

    currentLoad += stopSlots;
    currentSegmentItems.push(...newTpItems, ...step.farmingItems);
    segmentStops.push(step);
    stopsOnly.push({ ...step, isBank: false });
  }

  // Combine: initial bank + all stops with mid-route banks
  const finalRoute = [withBanks[0], ...stopsOnly];

  // Number all steps
  let stepNum = 0;
  return finalRoute.map(s => {
    stepNum++;
    return { ...s, step: stepNum };
  });
}

// Item categorization for bank stops
function categorizeItems(items) {
  const categories = {
    teleport: { label: "🧭 Teleport Equipment", color: "#c9a84c", bg: "#2a2510", border: "#4a3f20", items: [] },
    seeds: { label: "🌱 Seeds & Saplings", color: "#88cc88", bg: "#1a2a1a", border: "#2a442a", items: [] },
    payments: { label: "💰 Gardener Payments (noted)", color: "#ddaa55", bg: "#2a2210", border: "#443820", items: [] },
    runes: { label: "✨ Runes", color: "#9090cc", bg: "#1a1a2a", border: "#333366", items: [] },
    compost: { label: "🪣 Compost", color: "#8B6914", bg: "#2a2010", border: "#443010", items: [] },
  };

  for (const item of items) {
    const lower = item.toLowerCase();
    if (lower.includes("rune")) {
      categories.runes.items.push(item);
    } else if (lower.includes("seed") || lower.includes("sapling") || lower.includes("spore")) {
      categories.seeds.items.push(item);
    } else if (lower.includes("compost") || lower.includes("ultracompost") || lower.includes("bottomless")) {
      categories.compost.items.push(item);
    } else if (lower.includes("(10)") || lower.includes("(5)") || lower.includes("×") ||
               lower.includes("berry") || lower.includes("fruit") || lower.includes("coconut") ||
               lower.includes("spine") || lower.includes("leaf") || lower.includes("fibre") ||
               lower.includes("malt") || lower.includes("poison ivy") || lower.includes("mushroom") ||
               lower.includes("payment") || lower.includes("sweetcorn") || lower.includes("watermelon") ||
               lower.includes("pineapple") || lower.includes("papaya") || lower.includes("snape grass") ||
               lower.includes("coins")) {
      categories.payments.items.push(item);
    } else {
      categories.teleport.items.push(item);
    }
  }

  return Object.values(categories).filter(c => c.items.length > 0);
}

function computeBankWithdrawals(allSteps, fromIdx, alreadyHave) {
  const tpItems = new Set();
  const aggSeeds = {}; // seed name → total qty
  const aggPayments = {}; // payment name → total qty
  let needsCoins = false;
  let slots = ALWAYS_EQUIPPED;

  let stopsCount = 0;
  for (let i = fromIdx; i < allSteps.length; i++) {
    const s = allSteps[i];
    const newTp = (s.teleportItems||[]).filter(it => !tpItems.has(it));
    const newSlots = newTp.length + s.farmingSlots;
    if (slots + newSlots > MAX_INVENTORY) break;
    newTp.forEach(it => tpItems.add(it));
    // Aggregate seed and payment quantities
    if (s.seedQty) for (const [name, qty] of Object.entries(s.seedQty)) {
      aggSeeds[name] = (aggSeeds[name] || 0) + qty;
    }
    if (s.paymentQty) for (const [name, qty] of Object.entries(s.paymentQty)) {
      aggPayments[name] = (aggPayments[name] || 0) + qty;
    }
    if (s.needsTreeRemovalCoins) needsCoins = true;
    slots += newSlots;
    stopsCount++;
  }

  // Format aggregated items with total quantities
  const allItems = [...tpItems];
  for (const [name, qty] of Object.entries(aggSeeds)) {
    allItems.push(qty > 1 ? `${name} ×${qty}` : name);
  }
  if (needsCoins) allItems.push("Coins (200gp per tree removal)");
  for (const [name, qty] of Object.entries(aggPayments)) {
    allItems.push(qty > 1 ? `${name} ×${qty} patches` : name);
  }

  const categories = categorizeItems(allItems);

  return {
    categories,
    totalSlots: slots,
    note: stopsCount >= allSteps.length - fromIdx
      ? `Withdraw everything for all ${stopsCount} stops`
      : `Withdraw items for the next ${stopsCount} stop${stopsCount !== 1 ? "s" : ""}`,
  };
}

function getAllRouteItems(route) {
  const equip = new Set();
  const farming = new Set();
  for (const s of route) {
    if (s.isBank) continue;
    (s.teleportItems||[]).forEach(it => equip.add(it));
    (s.farmingItems||[]).forEach(it => farming.add(it));
  }
  return { equipment: [...equip].sort(), farming: [...farming].sort() };
}

// ═══════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════
// Blank default — user must configure before first run
function defaultProfile() {
  return { quests: {}, diaries: {}, teleports: {}, unlocks: {} };
}
function isProfileEmpty(p) {
  return !Object.values(p.quests).some(Boolean) &&
    !Object.values(p.teleports).some(Boolean) &&
    !Object.values(p.unlocks).some(Boolean) &&
    !Object.values(p.diaries).some(v => v && v !== "None");
}
function loadProfile() { try { const s = localStorage.getItem("osrs_fp_v5"); if (s) return JSON.parse(s); } catch(e){} return defaultProfile(); }
function saveProfile(p) { localStorage.setItem("osrs_fp_v5", JSON.stringify(p)); }

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════
const SPD = { 1: { l: "Instant", c: "#4CAF50", d: "Direct TP to patch" }, 2: { l: "Fast", c: "#8BC34A", d: "TP + short run" }, 3: { l: "Medium", c: "#FFC107", d: "TP + moderate run" }, 4: { l: "Slow", c: "#FF9800", d: "TP + long run / multi-step" }, 5: { l: "Very Slow", c: "#f44336", d: "City TP + significant run" } };

function SpeedBadge({ speed }) {
  const s = SPD[speed] || SPD[3];
  return <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", backgroundColor: s.c + "22", color: s.c, border: `1px solid ${s.c}44` }}>{s.l}</span>;
}

function BankStop({ step }) {
  const isInitial = step.isInitial;
  return (
    <div style={{
      display: "flex", gap: 16, padding: 16, borderRadius: 10,
      background: isInitial ? "#1a2018" : "#1a1a28",
      border: `2px dashed ${isInitial ? "#4a8844" : "#4444aa"}`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: isInitial
          ? "linear-gradient(135deg, #4a8844, #2a5528)"
          : "linear-gradient(135deg, #4a4aee, #2a2a88)",
        color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0,
      }}>🏦</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 700, fontSize: 15, fontFamily: "'Cinzel', serif", marginBottom: 2,
          color: isInitial ? "#88cc88" : "#8888ee",
        }}>
          {isInitial ? "Starting Bank" : "Bank Stop"}
        </div>
        <div style={{ fontSize: 12, color: isInitial ? "#668866" : "#7777aa", marginBottom: 10 }}>
          {isInitial ? "Gear up before starting your run" : step.bankNote}
        </div>

        {/* Always-equipped tools */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
            🔧 Always Equipped
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {["Spade", "Seed dibber", "Rake"].map(t => (
              <span key={t} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: "#222", color: "#aaa", border: "1px solid #444" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Categorized items */}
        {(step.bankCategories || []).map((cat, ci) => (
          <div key={ci} style={{ marginBottom: ci < (step.bankCategories||[]).length - 1 ? 8 : 0 }}>
            <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
              {cat.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {cat.items.map((item, i) => (
                <span key={i} style={{
                  display: "inline-block", padding: "3px 8px", borderRadius: 4,
                  fontSize: 11, fontWeight: 600,
                  background: cat.bg, color: cat.color, border: `1px solid ${cat.border}`,
                }}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpgradeHint({ upgrade }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={e => { e.stopPropagation(); setOpen(!open); }} style={{ marginTop: 8, padding: "8px 10px", borderRadius: 6, background: "#1a1a2a", border: "1px solid #2a2a44", cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12 }}>⚡</span>
          <span style={{ fontSize: 11, color: "#7a7aee", fontWeight: 600 }}>Faster option available</span>
          <SpeedBadge speed={upgrade.speed} />
        </div>
        <span style={{ color: "#555", fontSize: 12, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
      </div>
      {open && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #2a2a44" }}>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 6 }}>{upgrade.method}</div>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>You need to unlock:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {upgrade.missing.map((r, i) => (
              <span key={i} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, background: "#2a1a1a", color: "#ee8a7a", border: "1px solid #442a2a" }}>✗ {r}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RouteStep({ step, checked, onToggle }) {
  return (
    <div onClick={onToggle} style={{ display: "flex", gap: 16, padding: 16, borderRadius: 10, cursor: "pointer", background: checked ? "#1a2a1a" : "#1e1e1e", border: `1px solid ${checked ? "#2e5a2e" : "#2a2a2a"}`, opacity: checked ? 0.5 : 1, transition: "all 0.2s" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: checked ? "#2e5a2e" : "linear-gradient(135deg, #c9a84c, #8b7028)", color: checked ? "#4CAF50" : "#1a1a1a", fontWeight: 800, fontSize: 14, flexShrink: 0, fontFamily: "'Cinzel', serif" }}>{checked ? "✓" : step.step}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: checked ? "#4a8a4a" : "#e8dcc0", textDecoration: checked ? "line-through" : "none", fontFamily: "'Cinzel', serif" }}>{step.location}</span>
          <span style={{ fontSize: 11, color: "#666", padding: "1px 6px", borderRadius: 3, border: "1px solid #333", background: "#111" }}>{step.region}</span>
          {step.patchTypes.map(t => { const pt = PATCH_TYPES.find(p => p.id === t); return pt ? <span key={t} style={{ fontSize: 11, padding: "1px 6px", borderRadius: 3, background: pt.color + "22", color: pt.color, border: `1px solid ${pt.color}44` }}>{pt.icon} {pt.label}</span> : null; })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#999", fontSize: 12 }}>→</span>
          <span style={{ color: checked ? "#5a8a5a" : "#bbb", fontSize: 13, textDecoration: checked ? "line-through" : "none" }}>{step.teleport}</span>
          <SpeedBadge speed={step.teleportSpeed} />
        </div>
        {step.notes.length > 0 && <div style={{ marginTop: 4 }}>{step.notes.map((n,i) => <div key={i} style={{ fontSize: 11, color: "#8a7a50", fontStyle: "italic" }}>💡 {n}</div>)}</div>}
        {!checked && step.upgrade && <UpgradeHint upgrade={step.upgrade} />}
      </div>
    </div>
  );
}

function ProfileEditor({ profile, setProfile, onClose }) {
  const [l, setL] = useState(JSON.parse(JSON.stringify(profile)));
  const tQ = id => setL(p => ({ ...p, quests: { ...p.quests, [id]: !p.quests[id] } }));
  const sD = (id, t) => setL(p => ({ ...p, diaries: { ...p.diaries, [id]: t } }));
  const tT = id => setL(p => ({ ...p, teleports: { ...p.teleports, [id]: !p.teleports[id] } }));
  const tU = id => setL(p => ({ ...p, unlocks: { ...p.unlocks, [id]: !p.unlocks[id] } }));
  const save = () => { setProfile(l); saveProfile(l); onClose(); };
  const allQ = () => { const on = QUESTS.every(q => l.quests[q.id]); const u = {}; QUESTS.forEach(q => u[q.id] = !on); setL(p => ({ ...p, quests: { ...p.quests, ...u } })); };
  const allT = () => { const on = TELEPORTS.every(t => l.teleports[t.id]); const u = {}; TELEPORTS.forEach(t => u[t.id] = !on); setL(p => ({ ...p, teleports: { ...p.teleports, ...u } })); };

  // Group teleports
  const tpGroups = [
    { label: "Transport Networks", ids: TELEPORTS.filter(t => t.cat === "transport").map(t => t.id) },
    { label: "Planted Spirit Trees", desc: "Only enable trees you've actually planted (req 83 Farming)", ids: TELEPORTS.filter(t => t.cat === "planted").map(t => t.id) },
    { label: "Teleport Items", ids: TELEPORTS.filter(t => t.cat === "item").map(t => t.id) },
    { label: "Jewellery", ids: TELEPORTS.filter(t => t.cat === "jewellery").map(t => t.id) },
    { label: "Spellbooks", ids: TELEPORTS.filter(t => t.cat === "spellbook").map(t => t.id) },
    { label: "Diary Rewards", ids: TELEPORTS.filter(t => t.cat === "diary").map(t => t.id) },
    { label: "Quest Rewards", ids: TELEPORTS.filter(t => t.cat === "quest").map(t => t.id) },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, width: "min(95vw, 740px)", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 2, background: "linear-gradient(to bottom, #1a1a1a 80%, transparent)", padding: "20px 24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><h2 style={{ margin: 0, color: "#e0c97f", fontFamily: "'Cinzel', serif", fontSize: 20 }}>Account Profile</h2><p style={{ margin: "4px 0 0", color: "#888", fontSize: 12 }}>Configure your unlocks. Saved to browser storage.</p></div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: 24, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: "0 24px 24px" }}>
          {/* Quests */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ margin: 0, color: "#c9a84c", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Quests</h3>
              <button onClick={allQ} style={{ background: "none", border: "1px solid #444", borderRadius: 4, color: "#aaa", fontSize: 11, padding: "3px 10px", cursor: "pointer" }}>{QUESTS.every(q => l.quests[q.id]) ? "Deselect All" : "Select All"}</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 6 }}>
              {QUESTS.map(q => <label key={q.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, cursor: "pointer", background: l.quests[q.id] ? "#2a2a1a" : "#222", border: `1px solid ${l.quests[q.id] ? "#5a5020" : "#333"}` }}><input type="checkbox" checked={!!l.quests[q.id]} onChange={() => tQ(q.id)} style={{ accentColor: "#c9a84c" }} /><span style={{ color: l.quests[q.id] ? "#e0c97f" : "#888", fontSize: 13 }}>{q.name}</span></label>)}
            </div>
          </div>
          {/* Diaries */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 10px", color: "#c9a84c", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Achievement Diaries</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
              {DIARIES.map(d => <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 6, background: "#222", border: "1px solid #333" }}><span style={{ color: "#ccc", fontSize: 13 }}>{d.name}</span><select value={l.diaries[d.id]||"None"} onChange={e => sD(d.id, e.target.value)} style={{ background: "#1a1a1a", color: "#e0c97f", border: "1px solid #444", borderRadius: 4, padding: "3px 6px", fontSize: 12 }}>{DIARY_TIERS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>)}
            </div>
          </div>
          {/* Teleports — grouped */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ margin: 0, color: "#c9a84c", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Teleports & Transportation</h3>
              <button onClick={allT} style={{ background: "none", border: "1px solid #444", borderRadius: 4, color: "#aaa", fontSize: 11, padding: "3px 10px", cursor: "pointer" }}>{TELEPORTS.every(t => l.teleports[t.id]) ? "Deselect All" : "Select All"}</button>
            </div>
            {tpGroups.filter(g => g.ids.length > 0).map(grp => (
              <div key={grp.label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#777", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{grp.label}</div>
                {grp.desc && <div style={{ fontSize: 10, color: "#555", marginBottom: 6, fontStyle: "italic" }}>{grp.desc}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 5 }}>
                  {grp.ids.map(id => { const t = TELEPORTS.find(tp => tp.id === id); return t ? (
                    <label key={id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 10px", borderRadius: 6, cursor: "pointer", background: l.teleports[id] ? "#1a2a1a" : "#222", border: `1px solid ${l.teleports[id] ? "#205a20" : "#333"}` }}>
                      <input type="checkbox" checked={!!l.teleports[id]} onChange={() => tT(id)} style={{ accentColor: "#4CAF50", marginTop: 2 }} />
                      <div>
                        <div style={{ color: l.teleports[id] ? "#a5d6a7" : "#888", fontSize: 13 }}>{t.name}</div>
                        {t.desc && <div style={{ color: "#555", fontSize: 10, marginTop: 1 }}>{t.desc}</div>}
                      </div>
                    </label>
                  ) : null; })}
                </div>
              </div>
            ))}
          </div>
          {/* Other */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 10px", color: "#c9a84c", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Other Unlocks</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 6 }}>
              {OTHER_UNLOCKS.map(u => <label key={u.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, cursor: "pointer", background: l.unlocks[u.id] ? "#2a1a2a" : "#222", border: `1px solid ${l.unlocks[u.id] ? "#5a2050" : "#333"}` }}><input type="checkbox" checked={!!l.unlocks[u.id]} onChange={() => tU(u.id)} style={{ accentColor: "#9C27B0" }} /><span style={{ color: l.unlocks[u.id] ? "#ce93d8" : "#888", fontSize: 13 }}>{u.name}</span></label>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid #333" }}>
            <button onClick={onClose} style={{ background: "#333", border: "none", color: "#aaa", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>Cancel</button>
            <button onClick={save} style={{ background: "linear-gradient(135deg, #c9a84c, #8b7028)", border: "none", color: "#1a1a1a", padding: "10px 32px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Save Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [prof, setProf] = useState(() => loadProfile());
  const [showProf, setShowProf] = useState(false);
  const [selTypes, setSelTypes] = useState(["herb"]);
  const [route, setRoute] = useState(null);
  const [checked, setChecked] = useState({});
  const [showRoute, setShowRoute] = useState(false);
  const [showCropSelect, setShowCropSelect] = useState(false);
  const [cropSelections, setCropSelections] = useState({});
  const [first, setFirst] = useState(() => { try { return !localStorage.getItem("osrs_fp_v5"); } catch { return true; } });

  const handleSave = p => { setProf(p); setFirst(false); };
  const toggleType = id => setSelTypes(p => p.includes(id) ? p.filter(t => t !== id) : [...p, id]);
  const go = () => {
    const defaults = {};
    for (const t of selTypes) {
      if (!cropSelections[t] && CROPS[t] && CROPS[t].length > 0) {
        defaults[t] = CROPS[t][CROPS[t].length - 1].id;
      }
    }
    setCropSelections(prev => ({ ...prev, ...defaults }));
    setShowCropSelect(true);
  };
  const goGenerate = () => {
    setRoute(generateRoute(selTypes, prof, cropSelections));
    setChecked({});
    setShowCropSelect(false);
    setShowRoute(true);
  };
  const toggleChk = n => setChecked(p => ({ ...p, [n]: !p[n] }));

  const progress = route ? route.filter(s => !s.isBank && checked[s.step]).length : 0;
  const total = route ? route.filter(s => !s.isBank).length : 0;
  const bankCount = route ? route.filter(s => s.isBank).length : 0;
  const upgradeCount = route ? route.filter(s => !s.isBank && s.upgrade).length : 0;

  const presets = [
    { name: "Herb Run", types: ["herb"] },
    { name: "Herbs + Allotments", types: ["herb", "allotment", "flower"] },
    { name: "Tree Run", types: ["tree"] },
    { name: "Fruit Trees", types: ["fruitTree"] },
    { name: "All Trees", types: ["tree", "fruitTree", "calquat"] },
    { name: "Everything", types: PATCH_TYPES.map(p => p.id) },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#ccc", fontFamily: "'Crimson Text', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:8px} ::-webkit-scrollbar-track{background:#111} ::-webkit-scrollbar-thumb{background:#333;border-radius:4px}
        body{margin:0;background:#111}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <header style={{ background: "linear-gradient(to bottom, #1a1608, #111)", borderBottom: "1px solid #2a2210", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🌿</span>
          <div>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 800, color: "#e0c97f", letterSpacing: 1, margin: 0, lineHeight: 1.2 }}>FARMING ROUTE OPTIMIZER</h1>
            <span style={{ fontSize: 10, color: "#5a5030", letterSpacing: 2, textTransform: "uppercase" }}>Old School RuneScape</span>
          </div>
        </div>
        <button onClick={() => setShowProf(true)} style={{ background: "linear-gradient(135deg, #2a2210, #1a1608)", border: "1px solid #3a3020", color: "#c9a84c", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'Cinzel', serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>⚙</span> Edit Profile
        </button>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
        {!showRoute && !showCropSelect ? (
          <>
            {/* Profile setup banner */}
            {isProfileEmpty(prof) && (
              <div onClick={() => setShowProf(true)} style={{
                marginBottom: 24, padding: 20, borderRadius: 12, cursor: "pointer",
                background: "linear-gradient(135deg, #2a1a08, #1a1208)",
                border: "2px solid #c9a84c88",
                boxShadow: "0 0 20px rgba(201,168,76,0.15)",
                animation: "fadeIn 0.4s ease-out",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg, #c9a84c, #8b7028)",
                    fontSize: 22,
                  }}>⚙</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 700, color: "#e0c97f", marginBottom: 2 }}>
                      Set Up Your Account Profile
                    </div>
                    <div style={{ fontSize: 12, color: "#998860" }}>
                      Tell us your quests, diaries, teleports, and unlocks so we can calculate the fastest routes for your account.
                    </div>
                  </div>
                  <div style={{ color: "#c9a84c", fontSize: 20, flexShrink: 0 }}>→</div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#c9a84c", marginBottom: 6 }}>Select Patch Types</h2>
              <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>Choose which patches to include in your farming run</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {presets.map(p => {
                  const act = p.types.length === selTypes.length && p.types.every(t => selTypes.includes(t));
                  return <button key={p.name} onClick={() => setSelTypes(p.types)} style={{ background: act ? "#2a2210" : "#1a1a1a", border: `1px solid ${act ? "#5a4520" : "#333"}`, color: act ? "#e0c97f" : "#888", padding: "5px 12px", borderRadius: 16, cursor: "pointer", fontSize: 12, fontFamily: "'Crimson Text', serif" }}>{p.name}</button>;
                })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                {PATCH_TYPES.map(pt => {
                  const sel = selTypes.includes(pt.id);
                  const cnt = PATCHES.filter(p => p.type === pt.id && meetsReqs(p, prof)).length;
                  return <button key={pt.id} onClick={() => toggleType(pt.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, cursor: "pointer", background: sel ? pt.color + "15" : "#1a1a1a", border: `2px solid ${sel ? pt.color + "66" : "#2a2a2a"}`, color: sel ? pt.color : "#666", fontFamily: "'Crimson Text', serif", fontSize: 14, fontWeight: 600, textAlign: "left" }}>
                    <span style={{ fontSize: 20 }}>{pt.icon}</span>
                    <div><div>{pt.label}</div><div style={{ fontSize: 11, color: "#555", fontWeight: 400 }}>{cnt} patch{cnt !== 1 ? "es" : ""}</div></div>
                  </button>;
                })}
              </div>
            </div>
            <button onClick={go} disabled={!selTypes.length || isProfileEmpty(prof)} style={{ width: "100%", padding: 16, borderRadius: 12, border: "none", background: selTypes.length && !isProfileEmpty(prof) ? "linear-gradient(135deg, #c9a84c, #8b7028)" : "#333", color: selTypes.length && !isProfileEmpty(prof) ? "#1a1a1a" : "#666", fontSize: 16, fontWeight: 800, fontFamily: "'Cinzel', serif", letterSpacing: 1, cursor: selTypes.length && !isProfileEmpty(prof) ? "pointer" : "not-allowed", boxShadow: selTypes.length && !isProfileEmpty(prof) ? "0 4px 20px rgba(201,168,76,0.3)" : "none" }}>
              {isProfileEmpty(prof) ? "⚙ Set Up Profile First" : selTypes.length ? "Generate Optimal Route →" : "Select at Least One Patch Type"}
            </button>
            <div style={{ marginTop: 28, padding: 16, background: "#1a1a1a", borderRadius: 10, border: `1px solid ${isProfileEmpty(prof) ? "#44220088" : "#2a2a2a"}` }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: "#888", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Profile Summary</h3>
              {isProfileEmpty(prof) ? (
                <div style={{ fontSize: 12, color: "#665533", fontStyle: "italic" }}>
                  No profile configured yet. Click "Edit Profile" or the banner above to get started.
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "#666" }}>
                  <span><strong style={{ color: "#e0c97f" }}>{Object.values(prof.quests).filter(Boolean).length}</strong> quests</span>
                  <span><strong style={{ color: "#e0c97f" }}>{Object.values(prof.diaries).filter(v => v && v !== "None").length}</strong> diaries</span>
                  <span><strong style={{ color: "#e0c97f" }}>{Object.values(prof.teleports).filter(Boolean).length}</strong> teleports</span>
                  <span><strong style={{ color: "#e0c97f" }}>{Object.values(prof.unlocks).filter(Boolean).length}</strong> unlocks</span>
                </div>
              )}
            </div>
          </>
        ) : showCropSelect && !showRoute ? (
          <>
            {/* CROP SELECTION STEP */}
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setShowCropSelect(false)} style={{ background: "#1e1e1e", border: "1px solid #333", color: "#c9a84c", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'Cinzel', serif", fontWeight: 600 }}>← Back</button>
              <div>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#e0c97f", margin: 0 }}>Select Your Crops</h2>
                <p style={{ color: "#666", fontSize: 12, margin: "2px 0 0" }}>Choose what to plant at each patch type</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {selTypes.filter(t => CROPS[t] && CROPS[t].length > 0).map(typeId => {
                const pt = PATCH_TYPES.find(p => p.id === typeId);
                const crops = CROPS[typeId];
                const patchCount = PATCHES.filter(p => p.type === typeId && meetsReqs(p, prof)).length;
                const selected = cropSelections[typeId];
                const selectedCrop = crops.find(c => c.id === selected);

                return (
                  <div key={typeId} style={{
                    padding: 16, borderRadius: 10, background: "#1e1e1e",
                    border: `1px solid ${pt?.color || "#333"}33`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 20 }}>{pt?.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: pt?.color || "#ccc", fontFamily: "'Cinzel', serif" }}>{pt?.label}</span>
                      <span style={{ fontSize: 11, color: "#666" }}>({patchCount} patch{patchCount !== 1 ? "es" : ""})</span>
                    </div>
                    <select
                      value={selected || ""}
                      onChange={e => setCropSelections(prev => ({ ...prev, [typeId]: e.target.value }))}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: 8,
                        background: "#111", color: "#e0c97f", border: `1px solid ${pt?.color || "#444"}44`,
                        fontSize: 14, fontFamily: "'Crimson Text', serif",
                      }}
                    >
                      {crops.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.id === "pick_only" ? c.name : `${c.name} (Lvl ${c.lvl}) — ${c.seed}${c.payment ? ` | Pay: ${c.payment}` : " | No protection"}`}
                        </option>
                      ))}
                    </select>
                    {selectedCrop && selectedCrop.id !== "pick_only" && (
                      <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {selectedCrop.seed && (
                          <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "#1a2a1a", color: "#88cc88", border: "1px solid #2a442a" }}>
                            Bring: {selectedCrop.seed} × {patchCount}
                          </span>
                        )}
                        {selectedCrop.payment && (
                          <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "#2a2210", color: "#ddaa55", border: "1px solid #443820" }}>
                            Pay: {selectedCrop.payment} × {patchCount}
                          </span>
                        )}
                      </div>
                    )}
                    {selectedCrop && selectedCrop.id === "pick_only" && (
                      <div style={{ marginTop: 6 }}>
                        <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "#1a1a2a", color: "#9090cc", border: "1px solid #333366" }}>
                          Just picking — no seeds needed
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={goGenerate} style={{
              width: "100%", padding: 16, borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #c9a84c, #8b7028)",
              color: "#1a1a1a", fontSize: 16, fontWeight: 800, fontFamily: "'Cinzel', serif",
              letterSpacing: 1, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(201,168,76,0.3)",
            }}>
              Generate Optimal Route →
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => { setShowRoute(false); setShowCropSelect(true); }} style={{ background: "#1e1e1e", border: "1px solid #333", color: "#c9a84c", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'Cinzel', serif", fontWeight: 600 }}>← Back</button>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#e0c97f", margin: 0 }}>Your Farming Route</h2>
                <p style={{ color: "#666", fontSize: 12, margin: "2px 0 0" }}>
                  {total} stop{total !== 1 ? "s" : ""}
                  {bankCount > 0 && <span style={{ color: "#8888ee" }}> • {bankCount} bank stop{bankCount !== 1 ? "s" : ""}</span>}
                  {upgradeCount > 0 && <span style={{ color: "#7a7aee" }}> • {upgradeCount} upgrade{upgradeCount !== 1 ? "s" : ""}</span>}
                </p>
              </div>
              {total > 0 && <button onClick={() => setChecked({})} style={{ background: "none", border: "1px solid #333", color: "#888", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>Reset</button>}
            </div>

            {/* Total items overview */}
            {route && route.length > 0 && (() => {
              const { equipment, farming } = getAllRouteItems(route);
              return (equipment.length > 0 || farming.length > 0) ? (
                <div style={{ marginBottom: 16, padding: "14px 16px", background: "#1a1a12", borderRadius: 10, border: "1px solid #33301a" }}>
                  <div style={{ fontSize: 11, color: "#8a7a50", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🎒</span> Total Items Needed (full route overview)
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, background: "#1a2a1a", color: "#88bb88", border: "1px solid #2a442a" }}>Spade</span>
                    <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, background: "#1a2a1a", color: "#88bb88", border: "1px solid #2a442a" }}>Seed dibber</span>
                    <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, background: "#1a2a1a", color: "#88bb88", border: "1px solid #2a442a" }}>Rake</span>
                    {equipment.map(it => <span key={it} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: "#2a2510", color: "#e0c97f", border: "1px solid #4a3f20" }}>{it}</span>)}
                    {farming.map(it => <span key={it} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, background: "#1a1a2a", color: "#9090cc", border: "1px solid #333366" }}>{it}</span>)}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Progress */}
            {total > 0 && (
              <div style={{ marginBottom: 16, background: "#1a1a1a", borderRadius: 8, padding: "12px 16px", border: "1px solid #2a2a2a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#888" }}>Progress</span>
                  <span style={{ fontSize: 12, color: progress === total ? "#4CAF50" : "#c9a84c", fontWeight: 700 }}>{progress}/{total}{progress === total && " ✓ Run complete!"}</span>
                </div>
                <div style={{ height: 6, background: "#2a2a2a", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${total ? (progress / total) * 100 : 0}%`, background: progress === total ? "linear-gradient(90deg, #4CAF50, #8BC34A)" : "linear-gradient(90deg, #c9a84c, #e0c97f)", borderRadius: 3, transition: "width 0.3s ease" }} />
                </div>
              </div>
            )}

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {route && route.length > 0 ? route.map(s => (
                <div key={s.step} style={{ animation: `fadeIn 0.3s ease ${s.step * 0.04}s both` }}>
                  {s.isBank ? <BankStop step={s} /> : <RouteStep step={s} checked={!!checked[s.step]} onToggle={() => toggleChk(s.step)} />}
                </div>
              )) : (
                <div style={{ textAlign: "center", padding: "48px 24px", color: "#555", fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🚫</div>
                  No patches available for your current profile.<br />
                  <span style={{ fontSize: 12 }}>Try updating your profile or selecting different patch types.</span>
                </div>
              )}
            </div>

            {/* Legend */}
            {route && route.length > 0 && (
              <div style={{ marginTop: 24, padding: 14, background: "#1a1a1a", borderRadius: 10, border: "1px solid #222" }}>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Teleport Speed Legend</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[1,2,3,4,5].map(s => <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}><SpeedBadge speed={s} /><span style={{ fontSize: 11, color: "#666" }}>{SPD[s].d}</span></div>)}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showProf && <ProfileEditor profile={prof} setProfile={handleSave} onClose={() => { setShowProf(false); setFirst(false); }} />}
    </div>
  );
}
