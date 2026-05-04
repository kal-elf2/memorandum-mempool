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
