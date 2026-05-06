// HELPERS — design constants (colors, gradients) and HTML generation utilities

// ══════════════════════════════════════════════════════════════
//  DESIGN HELPERS
// ══════════════════════════════════════════════════════════════
const TYPE_COLORS = {
  EARTH:['#C49A38','#2A1800'], MIND:['#8A4FCC','#FFFFFF'], FIRE:['#E05020','#FFFFFF'],
  WATER:['#2E8FD8','#FFFFFF'], WIND:['#38D2C4','#FFFFFF'], ELECTRIC:['#E8C020','#2A1800'],
  SOUL:['#D060B0','#FFFFFF'],  AETHER:['#50B8E8','#FFFFFF'], VOID:['#3A1060','#D8A0FF'],
  ASTRAL:['#2A1080','#FFD060'],
};
const TYPE_EMOJI = { EARTH:'🌿',MIND:'🔮',FIRE:'🔥',WATER:'💧',WIND:'💨',ELECTRIC:'⚡',SOUL:'✨',AETHER:'🌀',VOID:'🌑',ASTRAL:'⭐' };
const RARITY_COLORS = { common:'#A0A0A8', uncommon:'#38A838', rare:'#2860D8', epic:'#8030C8', legendary:'#C88010' };

const CONGRATS_GRADIENTS = {
  AETHER:['#5969AF','#A9BABC'], ASTRAL:['#400CA2','#7746D3'], EARTH:['#B36B34','#C9AC73'],
  ELECTRIC:['#EDC33F','#F9E99E'], FIRE:['#EA4D00','#F78B32'], MIND:['#FFA2E7','#AE68C1'],
  SOUL:['#CC58AB','#FFA2E7'], VOID:['#2F1945','#3B376D'], WATER:['#2699D2','#85D5F7'],
  WIND:['#8EEDDB','#D3FCF9'],
};

/** Spirit inventory keys → theme gradient stops for evolution FX (trail, glow, impact). */
function spiritKeyGradientColors(spiritKey) {
  if (!spiritKey) return null;
  const k = String(spiritKey).toLowerCase();
  const typeMap = {
    fire: 'FIRE', water: 'WATER', electric: 'ELECTRIC', earth: 'EARTH',
    wind: 'WIND', mind: 'MIND', soul: 'SOUL', astral: 'ASTRAL',
    void: 'VOID', aether: 'AETHER',
  };
  const t = typeMap[k];
  if (!t) return null;
  const g = CONGRATS_GRADIENTS[t];
  return g ? [g[0], g[1]] : null;
}
const TYPE_PRIMARY = {
  EARTH:'#bf8f57', FIRE:'#ef6614', WIND:'#96eede', WATER:'#51b4e3',
  ELECTRIC:'#f3d66e', SOUL:'#e379c6', AETHER:'#8394b6', VOID:'#393165',
  MIND:'#925aae', ASTRAL:'#5a28b9',
};
function typePrimary(t) { return TYPE_PRIMARY[t] || '#888'; }

const HERO_GRADIENTS = {
  EARTH:['#bf8f57','#C9AC73'], MIND:['#925aae','#FFA2E7'], FIRE:['#ef6614','#F78B32'],
  WATER:['#51b4e3','#85D5F7'], WIND:['#96eede','#D3FCF9'], ELECTRIC:['#f3d66e','#F9E99E'],
  SOUL:['#e379c6','#FFA2E7'], AETHER:['#8394b6','#A9BABC'], VOID:['#393165','#3B376D'],
  ASTRAL:['#5a28b9','#7746D3'],
};

function heroGrad(type) {
  const g = HERO_GRADIENTS[type] || HERO_GRADIENTS.WIND;
  return `linear-gradient(135deg, ${g[0]} 0%, ${g[1]} 100%)`;
}
function tc(t)  { return (TYPE_COLORS[t]||['#888','#fff'])[0]; }
function tf(t)  { return (TYPE_COLORS[t]||['#888','#fff'])[1]; }
function ti(t)  { return TYPE_EMOJI[t] || '●'; }
function rc(r)  { return RARITY_COLORS[r] || '#888'; }

function typeIconEl(t) {
  const iconFile = TYPE_ICON_MAP[t];
  if (iconFile) return `<img class="type-ico-img" src="assets/icons/${iconFile}.png" alt="${t}" onerror="this.style.display='none'">`;
  return `<span class="type-ico-emoji" style="background:${tc(t)}">${ti(t)}</span>`;
}

function typeBadgeHtml(t) {
  const pc = typePrimary(t);
  return `<span class="type-badge" style="background:${pc}1A;color:${pc};border-color:${pc}44">
    ${typeIconEl(t)} ${t}
  </span>`;
}

function personalityBadgeHtml(p) {
  const col = PERSONALITY_COLORS[p] || '#888';
  return `<span class="badge personality" style="background:${col};border-color:${col};">${p}</span>`;
}

const TEAR_ICON_SRC = 'assets/icons/Tear_of_the_Goddess.png';

/** Keys that match `SPIRIT_MAP` (five spirit items). */
const SPIRIT_INVENTORY_KEYS = ['fire', 'water', 'earth', 'electric', 'astral'];

function normalizeSpiritKey(k) {
  return String(k || '').toLowerCase();
}

function getSpiritCount(k) {
  const key = normalizeSpiritKey(k);
  return Math.max(0, (S.spiritCounts && S.spiritCounts[key]) || 0);
}

function addSpirit(k, n = 1) {
  const key = normalizeSpiritKey(k);
  if (!SPIRIT_INVENTORY_KEYS.includes(key)) return;
  const add = Math.max(1, Math.floor(Number(n)) || 1);
  S.spiritCounts[key] = getSpiritCount(key) + add;
}

function tryConsumeSpirit(k) {
  const key = normalizeSpiritKey(k);
  if (getSpiritCount(key) < 1) return false;
  S.spiritCounts[key] = getSpiritCount(key) - 1;
  return true;
}

function getTearCount() {
  return Math.max(0, Math.floor(S.tearCount || 0));
}

function addTear(n = 1) {
  const add = Math.max(1, Math.floor(Number(n)) || 1);
  S.tearCount = getTearCount() + add;
}

function tryConsumeTear() {
  if (getTearCount() < 1) return false;
  S.tearCount = getTearCount() - 1;
  return true;
}

/**
 * Pulsing drift/twinkle motes (same CSS as `.evo-final-mote` in evolution-animation.css).
 * Used by congrats banner and detail hero.
 */
function fillAmbientMotes(hostEl, color1, color2, count = 20) {
  if (!hostEl) return;
  hostEl.innerHTML = '';
  const n = Math.max(0, Math.min(48, count));
  for (let i = 0; i < n; i++) {
    const m = document.createElement('div');
    m.className = 'evo-final-mote';
    const c = Math.random() < 0.52 ? color1 : Math.random() < 0.72 ? color2 : '#fff';
    m.style.setProperty('--mote-c', c);
    const near = Math.random() < 0.64;
    const cx = near ? 14 + Math.random() * 40 : 8 + Math.random() * 84;
    const cy = near ? 18 + Math.random() * 56 : 6 + Math.random() * 86;
    m.style.left = `${cx}%`;
    m.style.top = `${cy}%`;
    const size = near ? 2.2 + Math.random() * 2.6 : 1.4 + Math.random() * 2.2;
    m.style.width = `${size}px`;
    m.style.height = `${size}px`;
    m.style.opacity = `${near ? 0.38 + Math.random() * 0.28 : 0.16 + Math.random() * 0.22}`;
    m.style.animationDelay = `${-(Math.random() * 24)}s`;
    m.style.setProperty('--mote-dur', `${12 + Math.random() * 16}s`);
    m.style.setProperty('--mote-twinkle', `${3 + Math.random() * 4}s`);
    hostEl.appendChild(m);
  }
}

/** Badge HTML for inventory qty on spirit/tear icons (detail + confirms). */
function inventoryQtyBadgeHtml(qty, opts) {
  const q = Math.max(0, Math.floor(Number(qty)) || 0);
  if (q < 1) return '';
  if (opts && opts.variant === 'grid-teal') {
    return `<span class="gc-count spirit-inv-teal-badge" aria-hidden="true">${q}</span>`;
  }
  const cls = (opts && opts.className) ? String(opts.className) : 'inv-qty-badge';
  return `<span class="${cls}" aria-hidden="true">${q}</span>`;
}

/** Instance modal: tear stack badge + disabled / empty styling from prototype inventory. */
function syncImxTearButton(mem, inst) {
  const tearBtn = document.getElementById('imx-tear-btn');
  const tq = document.getElementById('imx-tear-qty');
  if (!tearBtn || !tq || !mem || !inst) return;
  const base = mem.base_memory;
  const maxMC = mem.max_mc;
  const spent = instanceMcSpent(inst, base);
  const atMax = spent >= maxMC;
  const tears = getTearCount();
  if (tears > 1) {
    tq.textContent = String(tears);
    tq.hidden = false;
  } else {
    tq.textContent = '';
    tq.hidden = true;
  }
  tearBtn.classList.toggle('imx-tear-empty', !atMax && tears < 1);
  tearBtn.disabled = atMax || (!atMax && tears < 1);
}
