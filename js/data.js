// DATA — image maps, catalog, game constants, and config

// ══════════════════════════════════════════════════════════════
//  DATA STORES
// ══════════════════════════════════════════════════════════════
let CATALOG       = {};   // dex_id → { name, primary, secondary, rarity, stage }
let MEMORIES      = {};   // dex_id → full memory object
let SPAWN_RANGES  = {};   // biome → { total_weight, ranges[] }

// ══════════════════════════════════════════════════════════════
//  IMAGE MAPS — all 144 + shiny variants
// ══════════════════════════════════════════════════════════════
const IMAGE_MAP = Object.fromEntries(
  Array.from({length:144}, (_,i) => {
    const id = String(i+1).padStart(3,'0');
    return [id, `assets/memories/${id}.png`];
  })
);
const SHINY_MAP = Object.fromEntries(
  Array.from({length:144}, (_,i) => {
    const id = String(i+1).padStart(3,'0');
    return [id, `assets/memories/${id}s.png`];
  })
);

const TYPE_ICON_MAP = {
  EARTH:'Earth', MIND:'Mind', FIRE:'Fire', WATER:'Water', WIND:'Wind',
  ELECTRIC:'Electric', SOUL:'Soul', AETHER:'Aether', VOID:'Void', ASTRAL:'Astral'
};
const SPIRIT_MAP = {
  fire: 'assets/spirits/fire.png',
  water: 'assets/spirits/water.png',
  earth: 'assets/spirits/earth.png',
  electric: 'assets/spirits/electric.png',
  astral: 'assets/spirits/astral.png',
};

// ══════════════════════════════════════════════════════════════
//  GAME CONSTANTS (from memory_dev_logic_spec.py)
// ══════════════════════════════════════════════════════════════
let SHINY_CHANCE = 0.01;
/** Dev only: show the "save card" popup on repeat encounters (normally first-time only). */
let DEV_SHOW_REPEAT_ENCOUNTER_POPUP = false;
const PERSONALITIES = ['brave', 'bubbly', 'bashful', 'grumpy'];
const PERSONALITY_COLORS = { brave:'#E05020', bubbly:'#D060B0', bashful:'#2E8FD8', grumpy:'#8A4FCC' };
const NFT_STATIC_MULTIPLIER = 1.80;

const SHINY_MULTIPLIERS = { common:2.60, uncommon:2.35, rare:2.35, legendary:2.05 };

const WOW_TABLES = {
  common:    [[1.00,1.10,0.50],[1.11,1.26,0.255],[1.27,1.58,0.150],[1.59,2.18,0.070],[2.19,3.35,0.022],[3.36,5.75,0.003]],
  uncommon:  [[1.00,1.10,0.48],[1.11,1.25,0.255],[1.26,1.54,0.160],[1.55,2.08,0.075],[2.09,3.15,0.026],[3.16,4.95,0.004]],
  rare:      [[1.00,1.08,0.270],[1.09,1.24,0.240],[1.25,1.52,0.230],[1.53,2.12,0.155],[2.13,3.20,0.075],[3.21,5.40,0.030]],
  legendary: [[1.00,1.06,0.290],[1.07,1.18,0.220],[1.19,1.44,0.215],[1.45,2.08,0.155],[2.09,3.35,0.080],[3.36,5.30,0.040]],
};

