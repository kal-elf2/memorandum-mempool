// GAME ACTIONS — level up, evolve, mint, debug helpers, reset

// ══════════════════════════════════════════════════════════════
//  ACTIONS
// ══════════════════════════════════════════════════════════════

function openNftArt() {
  // Placeholder — will eventually navigate to on-chain NFT art viewer
}

let _imxConfirmCb = null;

function clearImxConfirmVisual() {
  const vis = document.getElementById('imx-confirm-visual');
  if (!vis) return;
  vis.innerHTML = '';
  vis.hidden = true;
  vis.setAttribute('aria-hidden', 'true');
}

/**
 * @param {Object} [visualSpec] — `{ type:'spirit', key }` or `{ type:'tear' }`
 */
function showImxConfirm(msg, onConfirm, _pType, visualSpec) {
  const msgEl = document.getElementById('imx-confirm-msg');
  if (msgEl) msgEl.innerHTML = msg;
  _imxConfirmCb = onConfirm;
  const vis = document.getElementById('imx-confirm-visual');
  clearImxConfirmVisual();
  if (vis && visualSpec && visualSpec.type === 'spirit' && visualSpec.key) {
    const key = String(visualSpec.key).toLowerCase();
    const src = SPIRIT_MAP[key];
    const n = getSpiritCount(key);
    vis.hidden = false;
    vis.setAttribute('aria-hidden', 'false');
    vis.innerHTML = `
      <div class="imx-confirm-cost imx-confirm-cost--spirit">
        ${src ? `<span class="imx-confirm-ico-stack"><img src="${src}" alt="" class="imx-confirm-ico">${inventoryQtyBadgeHtml(n)}</span>` : ''}
        <p class="imx-confirm-cost-note">One <strong>${key}</strong> spirit will be consumed.</p>
      </div>`;
  } else if (vis && visualSpec && visualSpec.type === 'tear') {
    const n = getTearCount();
    vis.hidden = false;
    vis.setAttribute('aria-hidden', 'false');
    vis.innerHTML = `
      <div class="imx-confirm-cost imx-confirm-cost--tear">
        <span class="imx-confirm-ico-stack"><img src="${TEAR_ICON_SRC}" alt="" class="imx-confirm-ico">${inventoryQtyBadgeHtml(n, { variant: 'grid-teal' })}</span>
        <p class="imx-confirm-cost-note">One tear will be spent to reach max level.</p>
      </div>`;
  }

  const yesBtn = document.getElementById('imx-confirm-yes');
  const p = _pType || 'WIND';
  const cg = CONGRATS_GRADIENTS[p] || ['#b8dcff','#92bef0'];
  yesBtn.style.background = `linear-gradient(135deg, ${cg[0]}, color-mix(in srgb, ${cg[0]} 55%, ${cg[1]}) 45%, ${cg[1]})`;
  yesBtn.style.border = `1px solid color-mix(in srgb, ${cg[1]} 55%, rgba(0,0,0,0.2))`;
  yesBtn.style.color = tf(p);
  yesBtn.onclick = () => {
    const cb = _imxConfirmCb;
    _imxConfirmCb = null;
    document.getElementById('imx-confirm-overlay').classList.remove('show');
    clearImxConfirmVisual();
    if (cb) cb();
  };
  document.getElementById('imx-confirm-overlay').classList.add('show');
}
function closeImxConfirm() {
  document.getElementById('imx-confirm-overlay').classList.remove('show');
  clearImxConfirmVisual();
  _imxConfirmCb = null;
}

function syncDevInventoryBar() {
  if (typeof window !== 'undefined' && window.__MEMPOOL_PRODUCTION__) return;
  const host = document.getElementById('dev-spirit-pills');
  if (host) {
    host.innerHTML = SPIRIT_INVENTORY_KEYS.map(key => {
      const src = SPIRIT_MAP[key];
      const n = getSpiritCount(key);
      const badge = n > 0 ? inventoryQtyBadgeHtml(n, { className: 'inv-qty-badge dev-spirit-stock' }) : '';
      return `<button type="button" class="dev-spirit-pill" onclick="devGrantSpirit('${key}')" title="${key} spirit (+1) · owned ${n}">
        <img src="${src}" alt="">
        ${badge}
        <span class="dev-spirit-plus">+1</span>
      </button>`;
    }).join('');
  }
  const dt = document.getElementById('dev-tear-total');
  if (dt) dt.textContent = String(getTearCount());
}

function devGrantSpirit(key) {
  addSpirit(key, 1);
  syncDevInventoryBar();
  const ds = document.getElementById('screen-detail');
  if (ds && ds.classList.contains('active')) renderDetail();
  const gridOpen = document.getElementById('screen-grid')?.classList.contains('active');
  if (gridOpen) renderGrid();
}

function devAddTear(amount) {
  addTear(typeof amount === 'number' ? amount : 1);
  syncDevInventoryBar();
  const ds = document.getElementById('screen-detail');
  if (ds && ds.classList.contains('active')) renderDetail();
}

function doTearMaxLevel() {
  const mem = MEMORIES[S.selectedId]; if (!mem) return;
  const base = mem.base_memory;
  const inst = currentInstance(); if (!inst) return;
  const maxMC = mem.max_mc;
  const spent = instanceMcSpent(inst, base);
  if (spent >= maxMC) return;
  if (getTearCount() < 1) return;

  const pType = mem.type[0] || 'WIND';
  const panel = document.getElementById('imx-panel');
  showImxConfirm(
    `Bring <strong>${mem.name}</strong> to <strong>max level</strong>?<br><span style="font-size:11px;color:#888;font-weight:400">This cannot be undone.</span>`,
    () => {
      playTearMaxLevelAnimation(panel, {
        onConsumedOne: () => {
          tryConsumeTear();
          syncDevInventoryBar();
          const mem2 = MEMORIES[S.selectedId];
          const inst2 = currentInstance();
          syncImxTearButton(mem2, inst2);
        },
        onApplyLevel: () => {
          inst.mc_spent = maxMC;
          renderDetail();
        },
        onComplete: () => {
          syncDevInventoryBar();
        },
      });
    },
    pType,
    { type: 'tear' }
  );
}

function doLevelUp() {
  const mem = MEMORIES[S.selectedId]; if (!mem) return;
  const base  = mem.base_memory;
  const bank  = S.bank[base]     || 0;
  const inst  = currentInstance(); if (!inst) return;
  const maxMC = mem.max_mc;
  const spent = instanceMcSpent(inst, base);
  if (spent >= maxMC || bank < 1) return;

  S.bank[base] = bank - 1;
  inst.mc_spent = spent + 1;
  renderDetail();
}

let _evoBranchPick = null;

/** Left-to-right spirit order for branch picker (Orbyx line: fire → water → electric). */
const _EVO_BRANCH_SPIRIT_ORDER = ['fire', 'water', 'electric'];

/** Theme palette for spirit picker pads (matches evolved branch primary type when possible). */
function _branchSpiritThemeColors(branch) {
  const tid = branch?.to;
  const tm = tid ? MEMORIES[tid] : null;
  const fromMem = tm?.type?.[0];
  if (fromMem && CONGRATS_GRADIENTS[fromMem]) {
    const g = CONGRATS_GRADIENTS[fromMem];
    return [g[0], g[1]];
  }
  const k = String(branch?.spirit || '').toLowerCase();
  const fallbackType =
    { fire: 'FIRE', water: 'WATER', electric: 'ELECTRIC', earth: 'EARTH',
      wind: 'WIND', mind: 'MIND', soul: 'SOUL', astral: 'ASTRAL', void: 'VOID',
      aether: 'AETHER' }[k] || 'WIND';
  const g = CONGRATS_GRADIENTS[fallbackType] || CONGRATS_GRADIENTS.WIND;
  return [g[0], g[1]];
}

function _sortEvolutionBranches(branches) {
  return [...branches].sort((a, b) => {
    const ka = String(a.spirit || '').toLowerCase();
    const kb = String(b.spirit || '').toLowerCase();
    const ia = _EVO_BRANCH_SPIRIT_ORDER.indexOf(ka);
    const ib = _EVO_BRANCH_SPIRIT_ORDER.indexOf(kb);
    const ra = ia === -1 ? _EVO_BRANCH_SPIRIT_ORDER.length : ia;
    const rb = ib === -1 ? _EVO_BRANCH_SPIRIT_ORDER.length : ib;
    if (ra !== rb) return ra - rb;
    return ka.localeCompare(kb);
  });
}

function openEvoBranchPicker(id, mem, inst) {
  const overlay = document.getElementById('evo-branch-overlay');
  const host = document.getElementById('evo-branch-options');
  if (!overlay || !host || !mem.evolution_branches?.length) return;
  _evoBranchPick = { id, mem, inst };
  const sub = document.getElementById('evo-branch-sub');
  if (sub) {
    sub.textContent = `Tap a spirit to evolve ${mem.name}.`;
  }
  host.innerHTML = '';
  _sortEvolutionBranches(mem.evolution_branches).forEach(b => {
    const spiritKey = b.spirit || '';
    const owned = spiritKey ? getSpiritCount(spiritKey) : 0;
    const hasSpirit = !spiritKey || owned >= 1;
    const asset = spiritKey && SPIRIT_MAP[spiritKey];
    const [c1, c2] = _branchSpiritThemeColors(b);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'evo-branch-spirit-hit';
    btn.disabled = !hasSpirit;
    btn.style.setProperty('--spirit-pad-c1', c1);
    btn.style.setProperty('--spirit-pad-c2', c2);
    btn.title = hasSpirit ? `${spiritKey} (×${owned})` : `${spiritKey} — none owned`;
    const qtyHtml = spiritKey ? `<span class="evo-branch-spirit-qty">×${owned}</span>` : '';
    const inner = asset
      ? `<span class="evo-branch-spirit-pad"><img src="${asset}" alt="${spiritKey}" loading="lazy"></span>${qtyHtml}`
      : `<span class="evo-branch-spirit-pad"><span class="evo-branch-spirit-fallback">🔮</span></span>${qtyHtml}`;
    btn.innerHTML = inner;
    btn.onclick = () => confirmEvoBranch(b.to, spiritKey);
    host.appendChild(btn);
  });
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeEvoBranchPicker() {
  document.getElementById('evo-branch-overlay')?.classList.remove('show');
  document.getElementById('evo-branch-overlay')?.setAttribute('aria-hidden', 'true');
  _evoBranchPick = null;
}

/** Saved-stage mint eligibility: evolving clears the captured stage for sealing */
function _imxConfirmEvolveMintGateDisclaimerHtml() {
  return `<div class="imx-confirm-nft-evo-disclaimer imx-confirm-mint-gate"><strong>Eternal bond (mint)</strong><span>Evolving advances this Memory past its <em>captured</em> stage. That bond can only be sealed from the form you saved—you won’t be able to mint the stage you’re leaving behind.</span></div>`;
}

/** Evolve confirm footer: skip when already bonded NFT; warn mint path only for saved + mintable. */
function _imxConfirmEvolveDisclaimerBlock(inst, mem) {
  if (!inst || !mem) return '';
  if (inst.is_nft) return '';
  if (mem.mintable && inst.origin_state === 'saved') return _imxConfirmEvolveMintGateDisclaimerHtml();
  return '';
}

function confirmEvoBranch(targetId, spiritKey) {
  const pick = _evoBranchPick;
  if (!pick) return;
  const { id, mem, inst } = pick;
  const target = MEMORIES[targetId];
  if (!target) return;
  closeEvoBranchPicker();
  const confirmThemeType = mem.type[0] || 'WIND';
  const spiritDisp = spiritKey
    ? spiritKey.charAt(0).toUpperCase() + spiritKey.slice(1).toLowerCase()
    : '';
  /** Branch pick (e.g. Orbyx): don’t spoil the evolved form’s name — spirit + cost are in the visual block. */
  const branchConfirmHtml = spiritDisp
    ? `Evolve<br><strong>${mem.name}</strong> with the <strong>${spiritDisp}</strong> spirit.<br><span style="font-size:11px;color:#888;font-weight:400">This cannot be undone.</span>`
    : `Evolve<br><strong>${mem.name}</strong>?<br><span style="font-size:11px;color:#888;font-weight:400">This cannot be undone.</span>`;
  const nftNote = _imxConfirmEvolveDisclaimerBlock(inst, mem);
  showImxConfirm(
    branchConfirmHtml + nftNote,
    () => _launchEvolveAnimation(id, mem, inst, target, spiritKey),
    confirmThemeType,
    spiritKey ? { type: 'spirit', key: spiritKey } : null
  );
}

function doEvolve() {
  const id  = S.selectedId;
  const mem = MEMORIES[id]; if (!mem) return;
  const inst = currentInstance(); if (!inst) return;
  const base  = mem.base_memory;
  const spent = instanceMcSpent(inst, base);
  if (spent < mem.max_mc) return;

  if (mem.evolution_branches?.length > 1) {
    const playable = mem.evolution_branches.some(b => !b.spirit || getSpiritCount(b.spirit) >= 1);
    if (!playable) return;
    openEvoBranchPicker(id, mem, inst);
    return;
  }

  if (!mem.evolves_to) return;
  const target = MEMORIES[mem.evolves_to]; if (!target) return;

  const confirmThemeType = mem.type[0] || 'WIND';
  const linSpirit = mem.spirit_req || null;
  const nftNote = _imxConfirmEvolveDisclaimerBlock(inst, mem);
  showImxConfirm(
    `Evolve <strong>${mem.name}</strong> into <strong>${target.name}</strong>?<br><span style="font-size:11px;color:#888;font-weight:400">This cannot be undone.</span>${nftNote}`,
    () => _launchEvolveAnimation(id, mem, inst, target),
    confirmThemeType,
    linSpirit ? { type: 'spirit', key: linSpirit } : null
  );
}

function _launchEvolveAnimation(id, mem, inst, target, chosenSpirit) {
  const spiritReq     = chosenSpirit != null && chosenSpirit !== ''
    ? chosenSpirit
    : (mem.spirit_req || null);
  const spiritAsset   = spiritReq ? (SPIRIT_MAP[spiritReq] || null) : null;
  const primaryType   = target.type[0] || 'WIND';

  // Close instance modal so the animation is unobstructed
  closeInstanceModal();

  playEvolutionAnimation({
    currentMemory: mem,
    nextMemory: target,
    instance: inst,
    spiritRequired: spiritReq,
    spiritAsset: spiritAsset,
    primaryType,
    onMidpointApplyEvolution: () => _executeEvolve(id, mem, inst, target.id, spiritReq || null),
    onComplete: () => {
      if (S._evoCongratsShown) {
        S._evoCongratsShown = false;
        showCongrats(inst, { gridReveal: true });
      }
    }
  });
}

function _executeEvolve(id, mem, inst, targetId, spiritConsumeKey) {
  const base  = mem.base_memory;
  const target = MEMORIES[targetId]; if (!target) return;

  if (spiritConsumeKey && !tryConsumeSpirit(spiritConsumeKey)) return;

  const newlyOwnsTarget = !S.instances.some(i => i.dex_id === targetId);
  const carryPersonality = inst.personality;
  const carryShiny       = inst.is_shiny;

  inst.dex_id        = targetId;
  inst.name          = target.name;
  inst.rarity        = target.rarity;
  inst.current_stage = target.stage;
  inst.origin_state  = 'evolved';
  inst.personality   = carryPersonality;
  inst.is_shiny      = carryShiny;

  inst.revealed_essence = Math.max(1, Math.round(inst.revealed_essence * 1.25));
  if (inst.is_nft) {
    inst.nft_essence = Math.max(1, Math.round(inst.revealed_essence * NFT_STATIC_MULTIPLIER));
  }

  S.progress[base] = 0;
  inst.mc_spent = mem.max_mc;

  S.owned[id]       = true;
  S.owned[targetId] = true;
  S.seen[targetId]  = true;

  if (inst.is_nft) {
    S.bondedLog[id]       = true;
    S.bondedLog[targetId] = true;
  }
  S.selectedId      = targetId;
  S.selectedInstanceIdx = 0;

  renderGrid();
  renderDetail();

  // Flag for onComplete callback — congrats will be shown after animation closes
  S._evoCongratsShown = newlyOwnsTarget;
}

function doMint() {
  const inst = currentInstance(); if (!inst) return;
  const mem  = MEMORIES[S.selectedId]; if (!mem) return;
  if (!mem.mintable || inst.is_nft || inst.origin_state !== 'saved') return;
  const base = mem.base_memory;
  if (instanceMcSpent(inst, base) < mem.max_mc) return;

  inst.is_nft              = true;
  inst.nft_minted_at_stage = inst.current_stage;
  inst.nft_essence         = Math.max(1, Math.round(inst.revealed_essence * NFT_STATIC_MULTIPLIER));
  S.bondedLog[S.selectedId] = true;
  renderDetail();
}

// ══════════════════════════════════════════════════════════════
//  DEBUG
// ══════════════════════════════════════════════════════════════
function addDebugInstances(ids) {
  ids.forEach(id => {
    const mem = MEMORIES[id]; if (!mem) return;
    const inst = {
      instanceId:      `${id}_debug`,
      dex_id:          id,
      name:            mem.name,
      rarity:          mem.rarity,
      personality:     PERSONALITIES[Math.floor(Math.random()*4)],
      is_shiny:        false,
      base_essence:    mem.essence,
      wow_multiplier:  1.05,
      wow_label:       '',
      revealed_essence: Math.max(1, Math.round(mem.essence * 1.05)),
      saved_stage:     mem.stage,
      current_stage:   mem.stage,
      origin_state:    'saved',
      is_nft:          false,
      nft_minted_at_stage: null,
      nft_essence:     null,
      mc_spent:        mem.stage > 1 ? (mem.max_mc - mem.mc_needed) : 0,
      acquired_at:     Date.now(),
    };
    S.seen[id] = true;
    S.owned[id] = true;
    S.instances.push(inst);
    const base = mem.base_memory;
    if (S.bank[base] === undefined) S.bank[base] = 0;
    if (S.progress[base] === undefined) S.progress[base] = 0;
  });
}

function debugOwn() {
  addDebugInstances(['001','002','003']);
  renderGrid();
  if (document.getElementById('screen-detail').classList.contains('active')) renderDetail();
  else showScreen('grid');
}

// Mark a random unseen dex_id as "discovered" (seen but not captured)
function randomDiscovery() {
  const all = Array.from({length:144}, (_,i) => String(i+1).padStart(3,'0'));
  const unseen = all.filter(id => !S.seen[id] && !S.instances.some(inst => inst.dex_id === id));
  if (!unseen.length) { return; }
  const id = unseen[Math.floor(Math.random() * unseen.length)];
  S.seen[id] = true;
  renderGrid();
  if (document.getElementById('screen-detail').classList.contains('active') && S.selectedId === id) renderDetail();
}

function debugSee(n) {
  for (let i = 4; i <= Math.min(3+n, 144); i++) S.seen[String(i).padStart(3,'0')] = true;
  renderGrid();
}

function debugAddMC(amount) {
  const detailScreen = document.getElementById('screen-detail');
  if (!detailScreen?.classList.contains('active')) return;
  const id  = S.selectedId;
  if (!id) return;
  const mem = MEMORIES[id]; if (!mem) return;
  const base = mem.base_memory;
  S.bank[base] = (S.bank[base] || 0) + amount;
  renderDetail();
}

function debugMC(amount) {
  debugAddMC(amount);
}

function resetAll() {
  S.seen = {}; S.owned = {}; S.bondedLog = {}; S.bank = {}; S.progress = {}; S.instances = []; S.mode = 'memories'; S.filter = 'all';
  S.collSort = 'akronite';
  S.instanceCardOpen = false;
  document.getElementById('imx-overlay')?.classList.remove('show');
  document.getElementById('imx-panel')?.classList.remove('show');
  closeEvoBranchPicker();
  closeImxConceptArt();
  if (_instCardKeydownHandler) {
    document.removeEventListener('keydown', _instCardKeydownHandler);
    _instCardKeydownHandler = null;
  }
  DEV_SHOW_REPEAT_ENCOUNTER_POPUP = false;
  const devRep = document.getElementById('dev-repeat-enc');
  if (devRep) devRep.checked = false;
  _congratsInstance = null;
  _congratsDismissToDetail = false;
  _congratsGridRevealDex = null;
  document.getElementById('congrats-overlay').classList.remove('show');
  document.getElementById('enc-popup').classList.remove('show');
  document.getElementById('enc-popup-overlay').classList.remove('show');
  if (_encPopupKeydownHandler) {
    document.removeEventListener('keydown', _encPopupKeydownHandler);
    _encPopupKeydownHandler = null;
  }
  if (_congratsKeydownHandler) {
    document.removeEventListener('keydown', _congratsKeydownHandler);
    _congratsKeydownHandler = null;
  }
  document.querySelectorAll('.ftab').forEach(t => t.classList.toggle('active', t.dataset.f === 'all'));
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === 'memories'));
  document.getElementById('type-icon-row')?.classList.remove('visible');
  document.getElementById('grid-q').value = '';
  const csr = document.getElementById('coll-sort-row');
  if (csr) csr.innerHTML = '';
  const sg = document.getElementById('screen-grid');
  if (sg) {
    clearTimeout(sg._hdrCollapseT);
    sg.classList.remove('grid-header-hiding', 'grid-expanded');
  }
  window._gridTypeScrollSuppressUntil = 0;
  const _gc = document.getElementById('grid-cells');
  if (_gc) _gc.scrollTop = 0;
  renderGrid();
  if (typeof resetDetailHeroMotesCache === 'function') resetDetailHeroMotesCache();
  showScreen('grid');
  S.spiritCounts = { fire: 0, water: 0, earth: 0, electric: 0, astral: 0 };
  S.tearCount = 0;
  syncDevInventoryBar();
}
