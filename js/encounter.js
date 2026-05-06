// ENCOUNTER — RNG engine, encounter popup, congrats screen, encounter log

// ══════════════════════════════════════════════════════════════
//  RNG ENGINE
// ══════════════════════════════════════════════════════════════
function rollWeighted(table) {
  const r = Math.random();
  let cumulative = 0;
  for (const [lo, hi, prob] of table) {
    cumulative += prob;
    if (r <= cumulative) return lo + Math.random() * (hi - lo);
  }
  return table[table.length - 1][0];
}

function rollEncounter(biomeType) {
  const biome = SPAWN_RANGES[biomeType];
  if (!biome) { alert(`No spawn table for ${biomeType}`); return null; }

  // Roll 1: which memory
  const r1     = Math.random();
  const ranges = biome.ranges;
  let entry = ranges.find(r => parseFloat(r.range_start) <= r1 && r1 < parseFloat(r.range_end));
  if (!entry) entry = ranges[ranges.length - 1];
  const dexId = entry.dex_id;
  const mem   = MEMORIES[dexId];
  if (!mem) return null;

  // Roll 2: Akronite (shiny) — never on wild evolution-only stages (need shiny N−1 + evolve)
  let isShiny = Math.random() < SHINY_CHANCE;
  if (isEvolutionOnlyForm(dexId)) isShiny = false;

  // Roll 3: Personality
  const personality = PERSONALITIES[Math.floor(Math.random() * 4)];

  // Roll 4: Wow multiplier
  const rarity    = mem.rarity;
  const wowTable  = WOW_TABLES[rarity] || WOW_TABLES.common;
  const wow       = rollWeighted(wowTable);

  // Compute Essence
  const baseEssence = mem.essence;
  const shinyMult   = isShiny ? (SHINY_MULTIPLIERS[rarity] || 2.60) : 1.0;
  const revealed    = Math.max(1, Math.round(baseEssence * shinyMult * wow));

  // Wow label
  let wowLabel = '';
  if (wow >= 2.50) wowLabel = '🔥 HUGE HIT';
  else if (wow >= 1.75) wowLabel = '⚡ BIG HIT';
  else if (wow >= 1.25) wowLabel = '✨ NICE HIT';

  const instance = {
    instanceId:     `${dexId}_${Date.now()}_${Math.floor(Math.random()*9999)}`,
    dex_id:         dexId,
    name:           mem.name,
    rarity,
    personality,
    is_shiny:       isShiny,
    base_essence:   baseEssence,
    wow_multiplier: Math.round(wow * 100) / 100,
    wow_label:      wowLabel,
    revealed_essence: revealed,
    saved_stage:    mem.stage,
    current_stage:  mem.stage,
    origin_state:   'saved',
    is_nft:         false,
    nft_minted_at_stage: null,
    nft_essence:    null,
    mc_spent:       mem.stage > 1 ? (mem.max_mc - mem.mc_needed) : 0,
    acquired_at:    Date.now(),
  };

  // Track if this is the very first encounter of this dex_id
  const isFirstEncounter = !S.seen[dexId] && !S.instances.some(i => i.dex_id === dexId);

  // Add to state
  S.seen[dexId]     = true;
  S.owned[dexId]    = true;
  S.instances.push(instance);

  // Add sanctuary yield memcore to the family bank (testing shortcut)
  const base = mem.base_memory;
  if (S.bank[base] === undefined) S.bank[base] = 0;
  S.bank[base] += (mem.yield || 0);
  if (S.progress[base] === undefined) S.progress[base] = 0;

  // Refresh grid
  renderGrid();

  instance._isFirst = isFirstEncounter;
  return instance;
}

let _encPopupKeydownHandler = null;

function showEncounterPopup(instance) {
  closeInstanceModal();
  const mem   = MEMORIES[instance.dex_id];
  const pType = mem.type[0] || 'WIND';
  const grad  = heroGrad(pType);

  document.getElementById('enc-popup-hero').style.background = grad;
  const src = instance.is_shiny ? SHINY_MAP[instance.dex_id] : IMAGE_MAP[instance.dex_id];
  document.getElementById('enc-popup-img').src = src || '';
  document.getElementById('enc-popup-wm').textContent = mem.name.charAt(0);
  document.getElementById('enc-popup-id').textContent = `#${instance.dex_id}`;
  document.getElementById('enc-popup-name').textContent = instance.name + (instance.is_shiny ? ' ★' : '');

  const tagsEl = document.getElementById('enc-popup-tags');
  const capR = (instance.rarity || 'common').charAt(0).toUpperCase() + (instance.rarity || 'common').slice(1);
  const rarityTag = `<span class="imx-pill" style="background:#ECECEF;color:#5A5A62;border-color:#D0D0D8">${capR}</span>`;
  const persCol = PERSONALITY_COLORS[instance.personality] || '#888';
  const persTag = `<span class="imx-pill" style="background:${persCol};color:#fff;border-color:${persCol}">${(instance.personality || '').toUpperCase()}</span>`;
  const shinyTag = instance.is_shiny ? '<span class="shiny-badge" style="font-size:8px;padding:3px 8px">★ Akronite</span>' : '';
  tagsEl.innerHTML = rarityTag + persTag + shinyTag;

  document.getElementById('enc-popup-ess').textContent = instance.revealed_essence + ' pts';

  document.getElementById('enc-popup').classList.add('show');
  document.getElementById('enc-popup-overlay').classList.add('show');

  if (_encPopupKeydownHandler)
    document.removeEventListener('keydown', _encPopupKeydownHandler);
  _encPopupKeydownHandler = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeEncPopup();
    }
  };
  document.addEventListener('keydown', _encPopupKeydownHandler);
}

function closeEncPopup() {
  document.getElementById('enc-popup').classList.remove('show');
  document.getElementById('enc-popup-overlay').classList.remove('show');
  if (_encPopupKeydownHandler) {
    document.removeEventListener('keydown', _encPopupKeydownHandler);
    _encPopupKeydownHandler = null;
  }
}

// ── Congratulations Screen ──────────────────────────────
let _congratsInstance = null;
let _congratsKeydownHandler = null;

let _congratsDismissToDetail = false;
/** First-capture flow: “View in Mempool” → grid All + scroll/reveal this dex id */
let _congratsGridRevealDex = null;

/** Same pulsing drift/twinkle as evolution reveal `.evo-final-mote` — banner only */
function _congratsFillBannerMotes(color1, color2) {
  fillAmbientMotes(document.getElementById('congrats-banner-motes'), color1, color2, 20);
}

function showCongrats(instance, opts) {
  closeInstanceModal();
  _congratsDismissToDetail = !!(opts && opts.dismissToDetail);
  _congratsGridRevealDex =
    opts && opts.gridReveal && instance && instance.dex_id != null
      ? (/^\d+$/.test(String(instance.dex_id))
        ? String(instance.dex_id).padStart(3, '0')
        : String(instance.dex_id))
      : null;
  _congratsInstance = instance;
  const capR    = (instance.rarity||'').charAt(0).toUpperCase()+(instance.rarity||'').slice(1);
  const persCol = PERSONALITY_COLORS[instance.personality] || '#888';

  // Creature image
  const src = instance.is_shiny ? SHINY_MAP[instance.dex_id] : IMAGE_MAP[instance.dex_id];
  document.getElementById('congrats-img').src = src || '';
  document.getElementById('congrats-name-wm').textContent =
    instance.name + (instance.is_shiny ? ' ★' : '');

  // Dynamic banner color from primary type
  const cgMem = MEMORIES[instance.dex_id];
  const pType = (cgMem && cgMem.type && cgMem.type[0]) || 'WATER';
  const cg = CONGRATS_GRADIENTS[pType] || CONGRATS_GRADIENTS.WATER;
  const strip = document.getElementById('congrats-strip');
  strip.style.setProperty('--cg-c1', cg[0]);
  strip.style.setProperty('--cg-c2', cg[1]);
  _congratsFillBannerMotes(cg[0], cg[1]);

  const _badge = (bg, fg, border, text) =>
    `<span class="congrats-badge" style="--cg-b-bg:${bg};--cg-b-fg:${fg};--cg-b-br:${border}">${text}</span>`;
  let badgesHtml = '';
  if (instance.is_shiny) badgesHtml += _badge('rgba(255,215,0,0.38)','#FFD700','rgba(255,215,0,0.55)','★ Akronite');
  badgesHtml += _badge(`${rc(instance.rarity)}50`, 'white', `${rc(instance.rarity)}80`, capR);
  badgesHtml += _badge(`${persCol}45`, 'white', `${persCol}70`, instance.personality);
  document.getElementById('congrats-badges').innerHTML = badgesHtml;

  document.getElementById('congrats-mem-name').textContent = instance.name + (instance.is_shiny ? ' ★' : '');

  document.getElementById('congrats-subtitle').textContent =
    'A new memory has been etched into your collection';

  // Essence + memcore reward display (only for captures, not evolutions)
  const rewardEl = document.getElementById('congrats-reward');
  if (instance.revealed_essence != null && instance.origin_state === 'saved') {
    const mem2 = MEMORIES[instance.dex_id];
    const mcGain = mem2 ? (mem2.yield || 0) : 0;
    const ess = instance.revealed_essence || 0;
    const wl  = instance.wow_label || '';
    let rewardHtml = '';
    rewardHtml += `<div class="congrats-reward-mc">+${mcGain} ◆</div>`;
    rewardHtml += `<div class="congrats-reward-ess"><span class="ess-val">${ess}</span><span class="ess-word">Essence</span></div>`;
    if (wl) {
      let wowCls = 'wow-nice';
      if (wl.includes('HUGE'))     wowCls = 'wow-huge';
      else if (wl.includes('BIG')) wowCls = 'wow-big';
      rewardHtml += `<div class="congrats-reward-wow ${wowCls}">${wl}</div>`;
    }
    rewardEl.innerHTML = rewardHtml;
    rewardEl.style.display = '';
  } else {
    rewardEl.innerHTML = '';
    rewardEl.style.display = 'none';
  }

  const cgBtn = document.querySelector('.congrats-btn-primary');
  if (cgBtn) {
    cgBtn.style.background = `linear-gradient(135deg, ${cg[0]}, color-mix(in srgb, ${cg[0]} 55%, ${cg[1]}) 45%, ${cg[1]})`;
    cgBtn.style.borderColor = `color-mix(in srgb, ${cg[1]} 55%, rgba(0,0,0,0.2))`;
    cgBtn.style.color = '#fff';
    cgBtn.style.boxShadow = `0 2px 12px rgba(0,0,0,0.16), 0 0 16px color-mix(in srgb, ${cg[0]} 25%, transparent), inset 0 1px 0 rgba(255,255,255,0.35)`;
  }

  document.getElementById('congrats-overlay').classList.add('show');

  if (_congratsKeydownHandler)
    document.removeEventListener('keydown', _congratsKeydownHandler);
  _congratsKeydownHandler = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeCongrats('dismiss');
    }
  };
  document.addEventListener('keydown', _congratsKeydownHandler);
}

function closeCongrats(dest) {
  document.getElementById('congrats-overlay').classList.remove('show');
  const bm = document.getElementById('congrats-banner-motes');
  if (bm) bm.innerHTML = '';
  if (_congratsKeydownHandler) {
    document.removeEventListener('keydown', _congratsKeydownHandler);
    _congratsKeydownHandler = null;
  }
  const revealDex = _congratsGridRevealDex;
  _congratsGridRevealDex = null;
  if (dest === 'detail' && _congratsInstance) {
    if (revealDex && typeof navigateGridAfterCongratsReveal === 'function') {
      navigateGridAfterCongratsReveal(revealDex);
    } else {
      openDetail(_congratsInstance.dex_id);
    }
  } else if (_congratsDismissToDetail && _congratsInstance) {
    S.selectedId = _congratsInstance.dex_id;
    showScreen('detail');
    renderDetail();
  } else {
    showScreen('grid');
  }
  _congratsDismissToDetail = false;
  _congratsInstance = null;
}

function logEncounter(instance) {
  const logEl = document.getElementById('enc-log-entries');
  const shinyStr = instance.is_shiny ? '<span class="enc-log-shiny">★</span>' : '';
  const entry = document.createElement('div');
  entry.className = 'enc-log-entry';
  entry.innerHTML = `
    ${shinyStr}
    <span style="color:rgba(255,255,255,0.85);font-weight:600">${instance.name}</span>
    <span class="enc-log-id">#${instance.dex_id}</span>
    <span style="color:${PERSONALITY_COLORS[instance.personality]};font-size:9px">${instance.personality}</span>
    <span style="margin-left:auto;font-size:10px;color:rgba(255,255,255,0.5)">${instance.revealed_essence} ess ${instance.wow_label ? instance.wow_label : ''}</span>`;
  if (logEl.children.length === 1 && logEl.children[0].tagName === 'SPAN') logEl.innerHTML = '';
  logEl.insertBefore(entry, logEl.firstChild);
  if (logEl.children.length > 20) logEl.removeChild(logEl.lastChild);
}

function buildEncounterButtons() {
  const types = ['EARTH','FIRE','WIND','WATER','ELECTRIC','SOUL','AETHER','VOID','MIND','ASTRAL'];
  const container = document.getElementById('enc-buttons');
  container.innerHTML = types.map(t => {
    const icon = TYPE_ICON_MAP[t];
    const color = tc(t);
    return `<button class="enc-btn" onclick="triggerEncounter('${t}')"
              style="border-color:${color}33;"
              onmouseover="this.style.borderColor='${color}88'"
              onmouseout="this.style.borderColor='${color}33'">
      <img class="enc-btn-img" src="assets/icons/${icon}.png" alt="${t}"
           onerror="this.style.display='none';this.nextSibling.style.display='block'">
      <span style="display:none;font-size:18px">${ti(t)}</span>
      <span class="enc-btn-label" style="color:${color}">${t}</span>
    </button>`;
  }).join('');
}

function triggerEncounter(biomeType) {
  const instance = rollEncounter(biomeType);
  if (!instance) return;
  logEncounter(instance);
  if (instance._isFirst) {
    showCongrats(instance, { gridReveal: !!instance._isFirst });
  } else if (DEV_SHOW_REPEAT_ENCOUNTER_POPUP) {
    showEncounterPopup(instance);
  }
  renderGrid();
}
