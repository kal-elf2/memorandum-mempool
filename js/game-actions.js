// GAME ACTIONS — level up, evolve, mint, debug helpers, reset

// ══════════════════════════════════════════════════════════════
//  ACTIONS
// ══════════════════════════════════════════════════════════════

function openNftArt() {
  // Placeholder — will eventually navigate to on-chain NFT art viewer
}

let _imxConfirmCb = null;
function showImxConfirm(msg, onConfirm, _pType) {
  document.getElementById('imx-confirm-msg').innerHTML = msg;
  _imxConfirmCb = onConfirm;
  const yesBtn = document.getElementById('imx-confirm-yes');
  const cg = CONGRATS_GRADIENTS[_pType] || ['#b8dcff','#92bef0'];
  yesBtn.style.background = `linear-gradient(135deg, ${cg[0]}, color-mix(in srgb, ${cg[0]} 55%, ${cg[1]}) 45%, ${cg[1]})`;
  yesBtn.style.border = `1px solid color-mix(in srgb, ${cg[1]} 55%, rgba(0,0,0,0.2))`;
  yesBtn.onclick = () => {
    const cb = _imxConfirmCb;
    _imxConfirmCb = null;
    document.getElementById('imx-confirm-overlay').classList.remove('show');
    if (cb) cb();
  };
  document.getElementById('imx-confirm-overlay').classList.add('show');
}
function closeImxConfirm() {
  document.getElementById('imx-confirm-overlay').classList.remove('show');
  _imxConfirmCb = null;
}

function doTearMaxLevel() {
  const mem = MEMORIES[S.selectedId]; if (!mem) return;
  const base = mem.base_memory;
  const inst = currentInstance(); if (!inst) return;
  const maxMC = mem.max_mc;
  const spent = instanceMcSpent(inst, base);
  if (spent >= maxMC) return;
  const pType = mem.type[0] || 'WIND';
  showImxConfirm(
    `Use <strong>Tear of the Goddess</strong> on <strong>${mem.name}</strong> to bring it to max level?`,
    () => { inst.mc_spent = maxMC; renderDetail(); },
    pType
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
    const hasSpirit = !spiritKey || PLAYER_SPIRITS[spiritKey];
    const asset = spiritKey && SPIRIT_MAP[spiritKey];
    const [c1, c2] = _branchSpiritThemeColors(b);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'evo-branch-spirit-hit';
    btn.disabled = !hasSpirit;
    btn.style.setProperty('--spirit-pad-c1', c1);
    btn.style.setProperty('--spirit-pad-c2', c2);
    btn.title = hasSpirit ? spiritKey : `${spiritKey} — not owned`;
    const inner = asset
      ? `<span class="evo-branch-spirit-pad"><img src="${asset}" alt="${spiritKey}" loading="lazy"></span>`
      : `<span class="evo-branch-spirit-pad"><span class="evo-branch-spirit-fallback">🔮</span></span>`;
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

function confirmEvoBranch(targetId, spiritKey) {
  const pick = _evoBranchPick;
  if (!pick) return;
  const { id, mem, inst } = pick;
  const target = MEMORIES[targetId];
  if (!target) return;
  closeEvoBranchPicker();
  const pType = target.type[0] || 'WIND';
  if (!inst.is_nft) {
    showImxConfirm(
      `Evolve <strong>${mem.name}</strong> with the <strong>${spiritKey}</strong> spirit?<br><span style="font-size:11px;color:#888;font-weight:400">This cannot be undone.</span>`,
      () => _launchEvolveAnimation(id, mem, inst, target, spiritKey),
      pType
    );
  } else {
    _launchEvolveAnimation(id, mem, inst, target, spiritKey);
  }
}

function doEvolve() {
  const id  = S.selectedId;
  const mem = MEMORIES[id]; if (!mem) return;
  const inst = currentInstance(); if (!inst) return;
  const base  = mem.base_memory;
  const spent = instanceMcSpent(inst, base);
  if (spent < mem.max_mc) return;

  if (mem.evolution_branches?.length > 1) {
    const playable = mem.evolution_branches.some(b => !b.spirit || PLAYER_SPIRITS[b.spirit]);
    if (!playable) return;
    openEvoBranchPicker(id, mem, inst);
    return;
  }

  if (!mem.evolves_to) return;
  const target = MEMORIES[mem.evolves_to]; if (!target) return;

  const targetPType = target.type[0] || 'WIND';
  if (!inst.is_nft) {
    showImxConfirm(
      `Evolve <strong>${mem.name}</strong> into <strong>${target.name}</strong>?<br><span style="font-size:11px;color:#888;font-weight:400">This cannot be undone.</span>`,
      () => _launchEvolveAnimation(id, mem, inst, target),
      targetPType
    );
  } else {
    _launchEvolveAnimation(id, mem, inst, target);
  }
}

function _launchEvolveAnimation(id, mem, inst, target, chosenSpirit) {
  const spiritReq     = chosenSpirit != null && chosenSpirit !== ''
    ? chosenSpirit
    : (mem.spirit_req || null);
  const spiritAsset   = spiritReq ? (SPIRIT_MAP[spiritReq] || null) : null;
  const primaryType   = target.type[0] || 'WIND';
  const secondaryType = target.type[1] || null;

  // Close instance modal so the animation is unobstructed
  closeInstanceModal();

  playEvolutionAnimation({
    currentMemory: mem,
    nextMemory: target,
    instance: inst,
    spiritRequired: spiritReq,
    spiritAsset: spiritAsset,
    primaryType: primaryType,
    secondaryType: secondaryType,
    onMidpointApplyEvolution: () => _executeEvolve(id, mem, inst, target.id),
    onComplete: () => {
      if (S._evoCongratsShown) {
        S._evoCongratsShown = false;
        showCongrats(inst, { dismissToDetail: true });
      }
    }
  });
}

function _executeEvolve(id, mem, inst, targetId) {
  const base  = mem.base_memory;
  const target = MEMORIES[targetId]; if (!target) return;

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
  showScreen('grid');
}
