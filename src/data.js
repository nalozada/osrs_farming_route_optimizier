// ═══════════════════════════════════════════════════════════════
// OSRS FARMING DATA — patches, teleports, crops, requirements.
// Cross-checked against https://oldschool.runescape.wiki
// ═══════════════════════════════════════════════════════════════

export const QUESTS = [
  { id: "myArm", name: "My Arm's Big Adventure" },
  { id: "makingFriends", name: "Making Friends with My Arm" },
  { id: "songOfElves", name: "Song of the Elves" },
  { id: "boneVoyage", name: "Bone Voyage" },
  { id: "fremennikTrials", name: "The Fremennik Trials" },
  { id: "watchtower", name: "Watchtower" },
  { id: "mourningsEndI", name: "Mourning's End Part I (started)" },
  { id: "theGreatBrainRobbery", name: "The Great Brain Robbery" },
  { id: "childrenOfTheSun", name: "Children of the Sun" },
];

export const DIARIES = [
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
export const DIARY_TIERS = ["None", "Easy", "Medium", "Hard", "Elite"];

// Spirit trees split: base network (always-available destinations) vs planted
export const TELEPORTS = [
  { id: "explorerRing", name: "Explorer's Ring 2+", cat: "diary" },
  { id: "ardougneCloak", name: "Ardougne Cloak 2+", cat: "diary" },
  { id: "ectophial", name: "Ectophial", cat: "quest" },
  { id: "spiritTree", name: "Spirit Trees (base network)", cat: "transport",
    desc: "Base network (no diary needed): Grand Exchange, Gnome Stronghold, Tree Gnome Village, Khazard Battlefield, Feldip Hills" },
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
  { id: "ringOfDueling", name: "Ring of Dueling", cat: "jewellery" },
  { id: "teleportCrystal", name: "Teleport Crystal", cat: "item" },
  { id: "lunarSpellbook", name: "Lunar Spellbook", cat: "spellbook" },
  { id: "ancientSpellbook", name: "Ancient Spellbook", cat: "spellbook" },
  { id: "arceuusSpellbook", name: "Arceuus Spellbook", cat: "spellbook" },
  // Standard Spellbook is always available to all accounts — not toggleable
  { id: "stonyBasalt", name: "Stony Basalt", cat: "item" },
  { id: "icyBasalt", name: "Icy Basalt", cat: "item" },
  { id: "farmingCape", name: "Farming Cape (99)", cat: "item" },
  { id: "quetzalWhistle", name: "Quetzal Whistle", cat: "item" },
  { id: "digsitePendant", name: "Digsite Pendant", cat: "item" },
  { id: "kharedstsMemoirs", name: "Kharedst's Memoirs / Book of the Dead", cat: "item" },
  { id: "pendantOfAtes", name: "Pendant of Ates", cat: "item" },
  { id: "ringOfElements", name: "Ring of the Elements", cat: "jewellery" },
  { id: "questPointCape", name: "Quest Point Cape", cat: "item" },
];

export const OTHER_UNLOCKS = [
  { id: "farmingGuild45", name: "Farming Guild Beginner (45 Farming)" },
  { id: "farmingGuild", name: "Farming Guild Intermediate (65 Farming)" },
  { id: "farmingGuild85", name: "Farming Guild Advanced (85 Farming)" },
  { id: "prifAccess", name: "Prifddinas Access" },
  { id: "fossilIsland", name: "Fossil Island Access" },
  { id: "harmonyIsland", name: "Harmony Island Access" },
  { id: "varlamoreAccess", name: "Varlamore Access" },
  { id: "kastoriQuetzal", name: "Quetzal landing site at Kastori" },
  { id: "fireOfNourishment", name: "Fire of Nourishment (Weiss herb patch)" },
];

// ═══════════════════════════════════════════════════════════════
// PATCH DATA
// proximityGroup: patches sharing a proximityGroup are merged
// into one stop even if not exactly co-located. This handles:
//   - Gnome Stronghold tree + fruit tree (short walk apart)
//   - Catherby herb/allotment + fruit tree (along same coastline)
//   - All Farming Guild tiers (same area)
// ═══════════════════════════════════════════════════════════════

export const PATCHES = [
  // ═══ HERB PATCHES ═══
  { id: "herb_falador", name: "Falador (South)", type: "herb",
    proximityGroup: "falador_south", region: "Asgarnia", routePriority: 10,
    farmingItems: [{ name: "Seed", slots: 1 }, { name: "Seed dibber", slots: 1 }, { name: "Spade", slots: 1 }, { name: "Rake", slots: 1 }],
    teleports: [
      { method: "Explorer's Ring → Cabbage Patch", requires: { teleports: ["explorerRing"] }, speed: 1, items: ["Explorer's Ring 2+"] },
      { method: "Ring of the Elements → Air Altar, run south", requires: { teleports: ["ringOfElements"] }, speed: 2, items: ["Ring of the Elements"] },
      { method: "Spirit Tree → Port Sarim, run north", requires: { teleports: ["spiritTreePortSarim"] }, speed: 3, items: [] },
      { method: "Ring of Wealth → Falador Park, run south", requires: { teleports: ["ringOfWealth"] }, speed: 4, items: ["Ring of Wealth"] },
      { method: "Falador Teleport, run south", requires: { teleports: ["standardSpellbook"] }, speed: 5, items: ["Law rune", "Air rune", "Water rune"] },
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
      { method: "Camelot Teleport, run east", requires: { teleports: ["standardSpellbook"] }, speed: 3, items: ["Law rune", "Air rune"] },
    ], notes: "5/10/15% extra herb yield w/ Med/Hard/Elite Kandarin Diary." },
  { id: "herb_ardougne", name: "Ardougne (North)", type: "herb",
    proximityGroup: "ardougne_north", region: "Kandarin", routePriority: 25,
    farmingItems: [{ name: "Seed", slots: 1 }],
    teleports: [
      { method: "Ardougne Cloak 2+ → Farming patch", requires: { teleports: ["ardougneCloak"] }, speed: 1, items: ["Ardougne Cloak 2+"] },
      { method: "Skills Necklace → Fishing Guild, run north", requires: { teleports: ["skillsNecklace"] }, speed: 2, items: ["Skills Necklace"] },
      { method: "Quest Point Cape teleport", requires: { teleports: ["questPointCape"] }, speed: 3, items: ["Quest Point Cape"] },
      { method: "Fairy Ring BLR", requires: { teleports: ["fairyRing"] }, speed: 4, items: ["Dramen/Lunar staff"] },
      { method: "Ardougne Teleport, run north", requires: { teleports: ["standardSpellbook"] }, speed: 5, items: ["Law rune", "Water rune"] },
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
      { method: "Trollheim Teleport, run west", requires: { teleports: ["standardSpellbook"], quests: ["myArm"] }, speed: 3, items: ["Law rune", "Fire rune"] },
    ], requirements: { quests: ["myArm"] },
    notes: "Disease-free. Req: My Arm's Big Adventure." },
  { id: "herb_weiss", name: "Weiss", type: "herb",
    proximityGroup: "weiss", region: "Fremennik", routePriority: 12,
    farmingItems: [{ name: "Seed", slots: 1 }],
    teleports: [
      { method: "Icy Basalt teleport", requires: { teleports: ["icyBasalt"] }, speed: 1, items: ["Icy Basalt"] },
      { method: "Fairy Ring DKS → Larry's boat, long run", requires: { teleports: ["fairyRing"] }, speed: 4, items: ["Dramen/Lunar staff"] },
    ], requirements: { quests: ["makingFriends"], unlocks: ["fireOfNourishment"] },
    notes: "Disease-free. Req: Making Friends with My Arm + Fire of Nourishment built." },
  { id: "herb_harmony", name: "Harmony Island", type: "herb",
    proximityGroup: "harmony_herb", region: "Morytania", routePriority: 50,
    farmingItems: [{ name: "Seed", slots: 1 }],
    teleports: [
      { method: "Harmony Island Teleport (Arceuus)", requires: { teleports: ["arceuusSpellbook"], quests: ["theGreatBrainRobbery"] }, speed: 2, items: ["Runes (Arceuus: Soul, Law, Nature)"] },
      { method: "Ectophial → docks → boat", requires: { teleports: ["ectophial"] }, speed: 5, items: ["Ectophial"] },
    ], requirements: { quests: ["theGreatBrainRobbery"], diaries: { morytania: "Elite" }, unlocks: ["harmonyIsland"] },
    notes: "Disease-free. Req: The Great Brain Robbery + Elite Morytania Diary." },
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
      { method: "Falador Teleport, run south", requires: { teleports: ["standardSpellbook"] }, speed: 5, items: ["Law rune", "Air rune", "Water rune"] },
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
      { method: "Camelot Teleport, run east", requires: { teleports: ["standardSpellbook"] }, speed: 3, items: ["Law rune", "Air rune"] },
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
    farmingItems: [{ name: "Seeds ×3", slots: 1 }, { name: "Compost", slots: 1 }],
    teleports: [
      { method: "Harmony Island Teleport (Arceuus)", requires: { teleports: ["arceuusSpellbook"], quests: ["theGreatBrainRobbery"] }, speed: 2, items: ["Runes (Arceuus: Soul, Law, Nature)"] },
      { method: "Ectophial → boat", requires: { teleports: ["ectophial"] }, speed: 5, items: ["Ectophial"] },
    ], requirements: { quests: ["theGreatBrainRobbery"], unlocks: ["harmonyIsland"] },
    notes: "Single allotment only. Req: The Great Brain Robbery." },
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
      { method: "Falador Teleport, run east", requires: { teleports: ["standardSpellbook"] }, speed: 2, items: ["Law rune", "Air rune", "Water rune"] },
    ], notes: "Disease-free w/ Elite Falador Diary." },
  { id: "tree_taverley", name: "Taverley", type: "tree",
    proximityGroup: "taverley_tree", region: "Asgarnia", routePriority: 25,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Falador Teleport, run NW through gate", requires: { teleports: ["standardSpellbook"] }, speed: 2, items: ["Law rune", "Air rune", "Water rune"] },
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
  { id: "tree_nemusRetreat", name: "Nemus Retreat", type: "tree",
    proximityGroup: "nemus_retreat", region: "Varlamore", routePriority: 35,
    farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }],
    teleports: [
      { method: "Pendant of Ates → Nemus Retreat, run north", requires: { teleports: ["pendantOfAtes"] }, speed: 2, items: ["Pendant of Ates"] },
      { method: "Fairy Ring AIS, run NW (cross river)", requires: { teleports: ["fairyRing"] }, speed: 3, items: ["Dramen/Lunar staff"] },
      { method: "Quetzal Whistle → Quetzacalli Gorge, run W (Mountain Guide)", requires: { teleports: ["quetzalWhistle"] }, speed: 4, items: ["Quetzal Whistle"] },
    ], requirements: { quests: ["childrenOfTheSun"], unlocks: ["varlamoreAccess"] },
    notes: "In Auburn Valley (not Auburnvale town). Req: Children of the Sun." },

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
      { method: "Camelot Teleport, run east", requires: { teleports: ["standardSpellbook"] }, speed: 3, items: ["Law rune", "Air rune"] },
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
    ], requirements: { quests: ["mourningsEndI"] }, notes: "Req: Mourning's End Part I (started)." },
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
  { id: "bush_rimmington", name: "Rimmington", type: "bush", proximityGroup: "rimmington", region: "Asgarnia", routePriority: 15, farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }], teleports: [{ method: "Skills Necklace → Crafting Guild, run S", requires: { teleports: ["skillsNecklace"] }, speed: 2, items: ["Skills Necklace"] }, { method: "Falador Teleport, run SW", requires: { teleports: ["standardSpellbook"] }, speed: 4, items: ["Law rune", "Air rune", "Water rune"] }], notes: null },
  { id: "bush_ardougne", name: "South Ardougne", type: "bush", proximityGroup: "ardougne_south_bush", region: "Kandarin", routePriority: 20, farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }], teleports: [{ method: "Ardougne Cloak 1+ → Monastery", requires: { teleports: ["ardougneCloak"] }, speed: 1, items: ["Ardougne Cloak 1+"] }, { method: "Fairy Ring DJP", requires: { teleports: ["fairyRing"] }, speed: 2, items: ["Dramen/Lunar staff"] }, { method: "Spirit Tree → Khazard Battlefield", requires: { teleports: ["spiritTree"] }, speed: 3, items: [] }], notes: null },
  { id: "bush_etceteria", name: "Etceteria", type: "bush", proximityGroup: "etceteria", region: "Fremennik", routePriority: 30, farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }], teleports: [{ method: "Spirit Tree → Etceteria (planted)", requires: { teleports: ["spiritTreeEtceteria"] }, speed: 1, items: [] }, { method: "Ring of Wealth → Miscellania", requires: { teleports: ["ringOfWealth"] }, speed: 2, items: ["Ring of Wealth"] }, { method: "Fairy Ring CIP", requires: { teleports: ["fairyRing"] }, speed: 3, items: ["Dramen/Lunar staff"] }], requirements: { quests: ["fremennikTrials"] }, notes: "Req: The Fremennik Trials (boat to Miscellania)." },
  { id: "bush_farmingGuild", name: "Farming Guild", type: "bush", proximityGroup: "farming_guild", region: "Kourend", routePriority: 5, farmingItems: [{ name: "Sapling", slots: 1 }, { name: "Payment", slots: 1 }], teleports: [{ method: "Skills Necklace → FG", requires: { teleports: ["skillsNecklace"] }, speed: 1, items: ["Skills Necklace"] }], requirements: { unlocks: ["farmingGuild45"] }, notes: "Req: 45 Farming (east wing)." },

  // ═══ HOPS PATCHES ═══
  { id: "hops_lumbridge", name: "Lumbridge", type: "hops", proximityGroup: "lumbridge_hops", region: "Misthalin", routePriority: 10, farmingItems: [{ name: "Seeds ×4", slots: 1 }], teleports: [{ method: "Lumbridge Teleport, run N", requires: { teleports: ["standardSpellbook"] }, speed: 2, items: ["Law rune", "Air rune", "Earth rune"] }], notes: null },
  { id: "hops_seers", name: "McGrubor's Wood", type: "hops", proximityGroup: "seers_hops", region: "Kandarin", routePriority: 20, farmingItems: [{ name: "Seeds ×4", slots: 1 }], teleports: [{ method: "Combat Bracelet → Ranging Guild", requires: { teleports: ["combatBracelet"] }, speed: 2, items: ["Combat Bracelet"] }, { method: "Fairy Ring ALS", requires: { teleports: ["fairyRing"] }, speed: 2, items: ["Dramen/Lunar staff"] }], notes: null },
  { id: "hops_yanille", name: "Yanille", type: "hops", proximityGroup: "yanille_hops", region: "Kandarin", routePriority: 25, farmingItems: [{ name: "Seeds ×4", slots: 1 }], teleports: [{ method: "Watchtower Teleport → top of Watchtower (N of patch)", requires: { teleports: ["standardSpellbook"], quests: ["watchtower"] }, speed: 2, items: ["Law rune ×2", "Earth rune ×2"] }, { method: "Fairy Ring CIQ", requires: { teleports: ["fairyRing"] }, speed: 3, items: ["Dramen/Lunar staff"] }], notes: "Req for Watchtower TP: Watchtower quest." },
  { id: "hops_entrana", name: "Entrana", type: "hops", proximityGroup: "entrana_hops", region: "Asgarnia", routePriority: 40, farmingItems: [{ name: "Seeds ×4", slots: 1 }], teleports: [{ method: "Explorer's Ring → Port Sarim + boat", requires: { teleports: ["explorerRing"] }, speed: 3, items: ["Explorer's Ring 2+"] }], notes: "No weapons/armour on Entrana!" },
  { id: "hops_aldarin", name: "Aldarin", type: "hops", proximityGroup: "aldarin", region: "Varlamore", routePriority: 45, farmingItems: [{ name: "Seeds ×4", slots: 1 }], teleports: [{ method: "Fairy Ring CKQ, run S into Aldarin", requires: { teleports: ["fairyRing"] }, speed: 3, items: ["Dramen/Lunar staff"] }, { method: "Quetzal Whistle → Civitas illa Fortis, charter/run S", requires: { teleports: ["quetzalWhistle"] }, speed: 5, items: ["Quetzal Whistle"] }], requirements: { unlocks: ["varlamoreAccess"] }, notes: "Varlamore hops patch (gardener Ercos)." },

  // ═══ SPECIAL PATCHES ═══
  { id: "cactus_alkharid", name: "Al Kharid Cactus", type: "cactus", proximityGroup: "alkharid_cactus", region: "Desert", routePriority: 10, farmingItems: [{ name: "Cactus seed", slots: 1 }], teleports: [{ method: "Amulet of Glory → Al Kharid", requires: { teleports: ["amuletOfGlory"] }, speed: 2, items: ["Amulet of Glory"] }, { method: "Ring of Dueling → Emir's Arena, run N", requires: { teleports: ["ringOfDueling"] }, speed: 3, items: ["Ring of Dueling"] }], notes: null },
  { id: "cactus_farmingGuild", name: "Farming Guild Cactus", type: "cactus", proximityGroup: "farming_guild", region: "Kourend", routePriority: 5, farmingItems: [{ name: "Cactus seed", slots: 1 }], teleports: [{ method: "Skills Necklace → FG", requires: { teleports: ["skillsNecklace"] }, speed: 1, items: ["Skills Necklace"] }], requirements: { unlocks: ["farmingGuild45"] }, notes: "Req: 45 Farming (east wing)." },
  { id: "calquat", name: "Calquat (Tai Bwo Wannai)", type: "calquat", proximityGroup: "calquat", region: "Karamja", routePriority: 10, farmingItems: [{ name: "Calquat sapling", slots: 1 }, { name: "Payment (8 poison ivy berries)", slots: 1 }], teleports: [{ method: "Fairy Ring CKR, run S", requires: { teleports: ["fairyRing"] }, speed: 2, items: ["Dramen/Lunar staff"] }, { method: "Glory → Karamja, run far S", requires: { teleports: ["amuletOfGlory"] }, speed: 4, items: ["Amulet of Glory"] }], notes: "One of three calquat patches (also Summer Shore, Kastori)." },
  { id: "calquat_kastori", name: "Kastori", type: "calquat", proximityGroup: "kastori_fruit", region: "Varlamore", routePriority: 12, farmingItems: [{ name: "Calquat sapling", slots: 1 }, { name: "Payment (8 poison ivy berries)", slots: 1 }], teleports: [{ method: "Quetzal Whistle → Kastori (landing site built)", requires: { teleports: ["quetzalWhistle"], unlocks: ["kastoriQuetzal"] }, speed: 1, items: ["Quetzal Whistle"] }, { method: "Quetzal Whistle → Hunter Guild, run SE", requires: { teleports: ["quetzalWhistle"] }, speed: 3, items: ["Quetzal Whistle"] }], requirements: { quests: ["childrenOfTheSun"], unlocks: ["varlamoreAccess"] }, notes: "Req: Children of the Sun." },
  { id: "seaweed", name: "Underwater Seaweed", type: "seaweed", proximityGroup: "seaweed", region: "Fossil Island", routePriority: 10, farmingItems: [{ name: "Seaweed spore ×2", slots: 1 }], teleports: [{ method: "Digsite Pendant → Fossil Island, row out & dive", requires: { teleports: ["digsitePendant"] }, speed: 2, items: ["Digsite Pendant"] }, { method: "Fairy Ring AKS → Mushroom Forest, run N, row & dive", requires: { teleports: ["fairyRing"] }, speed: 4, items: ["Dramen/Lunar staff"] }], requirements: { quests: ["boneVoyage"], unlocks: ["fossilIsland"] }, notes: "Two patches; not fairy-ring-accessible directly. Bring Fishbowl helmet + Diving apparatus. Req: Bone Voyage." },
  { id: "mushroom", name: "Canifis Mushroom", type: "mushroom", proximityGroup: "mushroom", region: "Morytania", routePriority: 10, farmingItems: [{ name: "Mushroom spore", slots: 1 }], teleports: [{ method: "Fairy Ring CKS, run N", requires: { teleports: ["fairyRing"] }, speed: 2, items: ["Dramen/Lunar staff"] }, { method: "Ectophial, run west", requires: { teleports: ["ectophial"] }, speed: 3, items: ["Ectophial"] }], notes: null },
  { id: "belladonna", name: "Draynor Belladonna", type: "belladonna", proximityGroup: "belladonna", region: "Misthalin", routePriority: 10, farmingItems: [{ name: "Belladonna seed", slots: 1 }], teleports: [{ method: "Glory → Draynor Village", requires: { teleports: ["amuletOfGlory"] }, speed: 1, items: ["Amulet of Glory"] }, { method: "Lumbridge TP, run west", requires: { teleports: ["standardSpellbook"] }, speed: 3, items: ["Law rune", "Air rune", "Earth rune"] }], notes: null },
  { id: "belladonna_auburnvale", name: "Auburnvale Belladonna", type: "belladonna", proximityGroup: "auburnvale_belladonna", region: "Varlamore", routePriority: 20, farmingItems: [{ name: "Belladonna seed", slots: 1 }], teleports: [{ method: "Fairy Ring AIS, run N", requires: { teleports: ["fairyRing"] }, speed: 2, items: ["Dramen/Lunar staff"] }, { method: "Quetzal Whistle → Civitas illa Fortis, run E", requires: { teleports: ["quetzalWhistle"] }, speed: 4, items: ["Quetzal Whistle"] }], requirements: { unlocks: ["varlamoreAccess"] }, notes: "East end of Auburnvale (Varlamore)." },
];

export const PATCH_TYPES = [
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
export const CROPS = {
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
    { id: "whiteLily", name: "White lily", seed: "White lily seed", lvl: 58 },
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
