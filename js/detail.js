// DETAIL — detail screen rendering, collection tab, instance navigation

// ══════════════════════════════════════════════════════════════
//  RENDER DETAIL
// ══════════════════════════════════════════════════════════════
function openDetail(id) {
  if (!CATALOG[id]) return; // data not loaded yet
  closeInstanceModal();
  S.selectedId = id;
  const mem = MEMORIES[id];
  if (mem) {
    const base = mem.base_memory;
    let insts = instancesFor(id);
    normalizeFamilyMcToInstances(base, insts);
    insts = instancesFor(id);
    S.selectedInstanceIdx = selectedIdxForSortedTop(insts, mem);
  } else {
    S.selectedInstanceIdx = 0;
  }
  document.querySelectorAll('.dtab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'details'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === 'tab-details'));
  showScreen('detail');
}

/**
 * One evolution-strip card: ??? vs silhouette vs full art from player discovery pipeline.
 * Matches main grid semantics (instances dex_id + S.owned / S.seen).
 */
function evoDexCapsuleHtml(eid, activeDetailDexId) {
  const em = MEMORIES[eid];
  const cat = CATALOG[eid];
  const name = em?.name || cat?.name || eid;
  const ptype = em?.type?.[0] || cat?.primary || 'WIND';
  const owned = S.instances.some(i => i.dex_id === eid) || !!S.owned[eid];
  const seenOnly = !!S.seen[eid] && !owned;
  const unknown = !S.seen[eid] && !owned;

  let imgEl;
  if (unknown) {
    imgEl = `<div class="evo-card-ph" style="font-size:22px;font-weight:700;color:var(--text-muted)">?</div>`;
  } else if (owned && IMAGE_MAP[eid]) {
    imgEl = `<img class="evo-card-img" src="${IMAGE_MAP[eid]}" alt="${name}" loading="lazy">`;
  } else if (seenOnly && IMAGE_MAP[eid]) {
    imgEl = `<img class="evo-card-img evo-silhouette" src="${IMAGE_MAP[eid]}" alt="" loading="lazy">`;
  } else {
    imgEl = `<div class="evo-card-ph">${ti(ptype)}</div>`;
  }

  const isCur = eid === activeDetailDexId;
  const clickable = owned && !isCur;
  const cardCls = `evo-card${isCur ? ' current' : ''}${!clickable && !isCur ? ' evo-card-locked' : ''}`;
  const onclk = clickable ? ` onclick="openDetail('${eid}')"` : '';
  const displayName = unknown ? '???' : name;

  return `<div class="${cardCls}"${onclk}>
    ${imgEl}
    <div class="evo-num">#${eid}</div>
    <div class="evo-name">${displayName}</div>
  </div>`;
}

function renderDetail() {
  const id   = S.selectedId;
  const mem  = MEMORIES[id];
  if (!mem) return;

  const base     = mem.base_memory;
  const bank     = S.bank[base]     || 0;
  const maxMC    = mem.max_mc;
  const pType    = mem.type[0] || 'WIND';
  const grad     = heroGrad(pType);
  let insts      = instancesFor(id);
  normalizeFamilyMcToInstances(base, insts);
  insts = instancesFor(id);
  const inst     = insts[Math.min(S.selectedInstanceIdx, Math.max(0, insts.length - 1))] || null;
  const progress = instanceMcSpent(inst, base);
  const atMax    = progress >= maxMC;
  const onColl   = document.getElementById('tab-collection').classList.contains('active');

  const detailBody = document.querySelector('#screen-detail .detail-body');
  if (detailBody) detailBody.classList.toggle('detail-body--collection-tab', onColl);

  document.getElementById('detail-hero').style.background  = grad;
  document.getElementById('detail-tabs').style.background  = grad;
  document.getElementById('hero-dex').textContent          = `#${id}`;
  document.getElementById('hero-name').textContent         = mem.name;

  const badgesEl = document.getElementById('hero-badges');
  const capR     = mem.rarity.charAt(0).toUpperCase() + mem.rarity.slice(1);
  badgesEl.innerHTML = `<span class="badge" style="background:${rc(mem.rarity)}33;border-color:${rc(mem.rarity)}66">${capR}</span>`;

  const wrap = document.getElementById('hero-img-wrap');
  const headerImg = IMAGE_MAP[id];
  wrap.innerHTML = headerImg
    ? `<img class="hero-img" src="${headerImg}" alt="${mem.name}">`
    : `<div class="hero-placeholder">${ti(pType)}</div>`;

  const wm = document.getElementById('hero-wm');
  if (wm) wm.textContent = mem.name;

  const typeHtml = (mem.type || []).map(t => typeBadgeHtml(t)).join('') || '';
  const elTypeD = document.getElementById('detail-type-details');
  const elTypeC = document.getElementById('detail-type-collection');
  if (elTypeD) elTypeD.innerHTML = typeHtml;
  if (elTypeC) elTypeC.innerHTML = typeHtml;

  document.getElementById('desc-text').textContent = mem.description;

  const familyStages = evoFamilyMaxStages(base);
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-chip wide">
      <span class="stat-val">Stage ${mem.stage} of ${familyStages}</span>
      <span class="stat-lbl">Evolution Stage</span>
    </div>
    <div class="stat-chip">
      <span class="stat-val">${mem.height} cm</span>
      <span class="stat-lbl">Height</span>
    </div>
    <div class="stat-chip">
      <span class="stat-val">${mem.weight} kg</span>
      <span class="stat-lbl">Weight</span>
    </div>`;

  const dtabMc = document.getElementById('dtab-mc');
  if (dtabMc) dtabMc.textContent = `${bank} ◆`;
  const mcDbg = document.getElementById('mc-dbg');
  if (mcDbg) mcDbg.textContent = `${base} · ${bank} avail · selected instance ${progress}/${maxMC}`;

  document.getElementById('mint-status').innerHTML = buildMintStatusInnerHtml(mem, inst, base, atMax);

  const sortRow = document.getElementById('coll-sort-row');
  if (sortRow && !sortRow.innerHTML.trim()) {
    sortRow.innerHTML = ['akronite','level','essence','recent','nft'].map(k => {
      const labels = { akronite: 'Akronite', level: 'Level', essence: 'Essence', recent: 'Recent', nft: 'Bonded' };
      return `<button type="button" class="coll-sort${S.collSort===k?' active':''}" data-sort="${k}" onclick="setCollSort('${k}')">${labels[k]}</button>`;
    }).join('');
  } else if (sortRow) {
    sortRow.querySelectorAll('.coll-sort').forEach(b => b.classList.toggle('active', b.dataset.sort === S.collSort));
  }

  const titleEl = document.getElementById('coll-memories-title');
  if (titleEl) titleEl.textContent = `${mem.name} Memories`;

  renderEvoLine(id, mem, base);
  renderCollection(id, mem, insts, inst);
  updateButtons(mem, bank, progress, maxMC, inst);

  if (S.instanceCardOpen && onColl && inst) {
    refreshInstanceModal(mem, id, inst, bank, progress, maxMC, atMax);
  } else if (S.instanceCardOpen && (!onColl || !inst)) {
    closeInstanceModal();
  }
}

function selectInstance(sortedIdx) {
  const mem = MEMORIES[S.selectedId]; if (!mem) return;
  const insts = instancesFor(S.selectedId);
  const sorted = sortInstances(insts, mem);
  const picked = sorted[sortedIdx];
  if (!picked) return;
  const idx = insts.findIndex(i => i.instanceId === picked.instanceId);
  S.selectedInstanceIdx = idx >= 0 ? idx : 0;
  S.instanceCardOpen = true;
  document.getElementById('imx-overlay')?.classList.add('show');
  document.getElementById('imx-panel')?.classList.add('show');
  const _nftBtn = document.getElementById('imx-nftart-btn');
  if (_nftBtn) _nftBtn.style.display = picked.is_nft ? 'flex' : 'none';
  if (_instCardKeydownHandler) document.removeEventListener('keydown', _instCardKeydownHandler);
  _instCardKeydownHandler = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (document.getElementById('evo-branch-overlay')?.classList.contains('show')) {
        closeEvoBranchPicker();
      } else if (document.getElementById('imx-concept-overlay')?.classList.contains('show')) {
        closeImxConceptArt();
      } else {
        closeInstanceModal();
      }
    }
  };
  document.addEventListener('keydown', _instCardKeydownHandler);
  renderDetail();
  syncDevPanelVisibility('detail');
}

function renderEvoLine(id, mem, base) {
  const chain = evoLineDexSequence(base, id);

  const rowHtml = chain.map((eid, idx) => {
    let prefix = '';
    if (idx > 0) {
      const prevEid = chain[idx - 1];
      const curEid = chain[idx];
      const prevMem = MEMORIES[prevEid];
      let spiritType = prevMem?.spirit_req;
      if (!spiritType && prevMem?.evolution_branches?.length > 1) {
        const br = prevMem.evolution_branches.find(b => b.to === curEid);
        spiritType = br?.spirit;
      }
      if (spiritType) {
        const spiritSrc = SPIRIT_MAP[spiritType];
        const spiritEl  = spiritSrc
          ? `<img class="spirit-img" src="${spiritSrc}" alt="${spiritType}" title="${spiritType} spirit required" onerror="this.style.display='none'">`
          : `<span style="font-size:16px" title="${spiritType} spirit required">🔮</span>`;
        prefix = `<span class="evo-arrow">→</span>
          <div class="spirit-node">${spiritEl}<span class="spirit-label">${spiritType}</span></div>
          <span class="evo-arrow">→</span>`;
      } else {
        prefix = `<span class="evo-arrow">→</span>`;
      }
    }

    return `${prefix}${evoDexCapsuleHtml(eid, id)}`;
  }).join('');

  /** Triple spirit fork UI — Orbyx (#104) only; all other families use a single linear strip above. */
  const showOrbyxFork = mem.id === '104' && mem.evolution_branches?.length > 1 && id === mem.id;

  let forkHtml = '';
  const evoLineEl = document.getElementById('evo-line');
  if (evoLineEl) evoLineEl.classList.toggle('evo-line--branched', !!showOrbyxFork);

  if (showOrbyxFork) {
    const rows = mem.evolution_branches.map(b => {
      const tid = b.to;
      const spiritKey = b.spirit || '';
      const spiritSrc = spiritKey && SPIRIT_MAP[spiritKey];
      const spiritEl = spiritSrc
        ? `<img class="spirit-img" src="${spiritSrc}" alt="" title="${spiritKey} spirit" onerror="this.style.display='none'">`
        : `<span style="font-size:18px" title="${spiritKey} spirit">🔮</span>`;
      return `<div class="evo-branch-row">
        <div class="spirit-node evo-branch-spirit">${spiritEl}<span class="spirit-label">${spiritKey}</span></div>
        <span class="evo-arrow evo-arrow-branch">→</span>
        ${evoDexCapsuleHtml(tid, id)}
      </div>`;
    }).join('');
    forkHtml = `
      <div class="evo-branched-wrap" role="group" aria-label="Spirit evolution paths">
        <div class="evo-pre-branch">${rowHtml}</div>
        <span class="evo-arrow evo-arrow-to-stack" aria-hidden="true">→</span>
        <div class="evo-branch-stack">${rows}</div>
      </div>`;
  }

  if (evoLineEl) {
    evoLineEl.innerHTML = forkHtml || rowHtml;
  }

  const reqEl = document.getElementById('evo-req');
  if (showOrbyxFork) {
    const opts = mem.evolution_branches.map(b => {
      const has = !b.spirit || PLAYER_SPIRITS[b.spirit];
      const icon = b.spirit && SPIRIT_MAP[b.spirit]
        ? `<img src="${SPIRIT_MAP[b.spirit]}" alt="">`
        : '🔮';
      return `<span class="evo-branch-req-chip${has ? '' : ' spirit-warn-miss'}">${has ? '✓' : '✗'} ${icon} <strong>${b.spirit}</strong> → #${b.to}</span>`;
    }).join('');
    const evoReq = mem.mc_for_evo || mem.mc_needed;
    reqEl.innerHTML = `
      <div class="evo-req-box">
        <div class="evo-req-static">This Memory can evolve along <strong>${mem.evolution_branches.length} spirit paths</strong>. Tap <strong>Evolve</strong> to choose a path. Needs <strong>${evoReq != null ? evoReq + ' ◆' : '—'}</strong> at max level.</div>
        <div class="evo-branch-req-row">${opts}</div>
      </div>`;
  } else if (mem.evolves_to) {
    const evoReq = mem.mc_for_evo || mem.mc_needed;
    const spirit = mem.spirit_req;
    const hasSp  = !spirit || !!PLAYER_SPIRITS[spirit];

    reqEl.innerHTML = `
      <div class="evo-req-box">
        <div class="evo-req-static">Next evolution needs <strong>${evoReq != null ? evoReq + ' ◆' : '—'}</strong> on a saved Memory — <strong>level up</strong> and <strong>evolve</strong> from <strong>Collection</strong> after you hit the cap.</div>
        ${spirit ? `<div class="spirit-warn">
          ${SPIRIT_MAP[spirit] ? `<img src="${SPIRIT_MAP[spirit]}" style="width:16px;height:16px;object-fit:contain">` : '🔮'}
          ${hasSp ? '✓ Have' : '✗ Need'} <strong>${spirit}</strong> spirit for this evolution
        </div>` : ''}
      </div>`;
  } else {
    reqEl.innerHTML = `<div class="evo-final" style="color:${tc(mem.type[0]||'WIND')}">
      ✓ Final Form — ${mem.name} is fully evolved
    </div>`;
  }
}

function renderCollection(id, mem, insts, activeInst) {
  document.getElementById('coll-count').textContent = `${insts.length} ${insts.length === 1 ? 'Memory' : 'Memories'}`;
  const el = document.getElementById('coll-content');

  if (!insts.length) {
    const primary = mem.type && mem.type[0] ? mem.type[0] : 'WIND';
    const biomeName = TYPE_ICON_MAP[primary] || primary.charAt(0) + primary.slice(1).toLowerCase();
    el.innerHTML = `<div class="coll-empty">
      <div class="coll-empty-ico">ⓘ</div>
      <p>No Memories to show for <strong>${mem.name}</strong> yet.</p>
      <p style="font-size:11px;line-height:1.45;color:var(--text-muted)">Head back to the <strong>${biomeName}</strong> shrine to save more and remember more.</p>
    </div>`;
    return;
  }

  let sorted = sortInstances(insts, mem);
  if (S.collSort === 'nft') sorted = sorted.filter(i => i.is_nft);

  if (!sorted.length && S.collSort === 'nft') {
    el.innerHTML = `<div style="text-align:center;padding:32px 16px;color:var(--text-muted);font-size:12px;line-height:1.5">
      <div style="font-size:18px;margin-bottom:6px;opacity:0.4">⬡</div>
      No bonded memories for ${mem.name}
    </div>`;
    return;
  }

  const base = mem.base_memory;
  el.innerHTML = sorted.map((ins, i) => {
    const src      = ins.is_shiny ? SHINY_MAP[id] : IMAGE_MAP[id];
    const isActive = activeInst && ins.instanceId === activeInst.instanceId;
    const spent    = instanceMcSpent(ins, base);
    const maxMC    = mem.max_mc;
    const stgFloor = maxMC - mem.mc_needed;
    const lvlPct   = Math.min(100, Math.round(((spent - stgFloor) / mem.mc_needed) * 100));
    const persCol  = PERSONALITY_COLORS[ins.personality] || '#888';
    const persU    = (ins.personality || '').charAt(0).toUpperCase() + (ins.personality || '').slice(1);
    return `<div class="inst-card${isActive?' active-inst':''}${ins.is_shiny?' akronite-inst':''}" onclick="selectInstance(${i})">
      ${ins.is_nft ? '<span class="inst-nft-corner">BONDED</span>' : ''}
      ${src ? `<img class="inst-card-img" src="${src}" alt="">` : `<div class="inst-card-ph">${ti(mem.type[0])}</div>`}
      <div class="inst-card-info">
        <div class="inst-card-name">${mem.name}${ins.is_shiny ? ' ★' : ''}</div>
        <div class="inst-card-prog">Lv ${spent}/${maxMC} · <span style="color:${persCol};font-weight:700">${persU}</span></div>
      </div>
      <div class="inst-card-ess">
        <div style="font-size:14px;font-weight:700;color:var(--text-dark)">${ins.is_nft ? ins.nft_essence : ins.revealed_essence}</div>
        <div style="font-size:9px;color:var(--text-muted)">essence</div>
      </div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════════
//  BUTTON STATE — correct game logic with max_mc gating
// ══════════════════════════════════════════════════════════════
function updateButtons(mem, bank, progress, maxMC, inst) {
  const atMax   = progress >= maxMC;
  const branchy = mem.evolution_branches?.length > 1;
  const hasSp   = branchy
    ? mem.evolution_branches.some(b => !b.spirit || PLAYER_SPIRITS[b.spirit])
    : (!mem.spirit_req || PLAYER_SPIRITS[mem.spirit_req]);
  const hasEvo  = !!mem.evolves_to || branchy;

  const lvlBtn  = document.getElementById('ic-btn-lvl');
  const evoBtn  = document.getElementById('ic-btn-evo');
  const mintBtn = document.getElementById('ic-btn-mint');
  if (!lvlBtn || !evoBtn || !mintBtn) return;

  // LEVEL UP: 1 ◆ per click — just needs any MC in bank + not at max
  const canLevel = !!inst && !atMax && bank >= 1;
  lvlBtn.disabled  = !canLevel;
  lvlBtn.title     = !inst ? 'No instance' : atMax ? 'Max level reached' : bank < 1 ? 'No ◆ in bank' : '';

  // EVOLVE: requires MAX level + spirit + evolution target(s)
  const canEvo  = !!inst && hasEvo && atMax && hasSp;
  evoBtn.disabled  = !canEvo;
  evoBtn.textContent = hasEvo ? 'Evolve' : 'Final Form';
  let evoTitle = '';
  if (!hasEvo) evoTitle = 'Final form';
  else if (!atMax) evoTitle = 'Reach max level first';
  else if (!hasSp && branchy) {
    const need = [...new Set(mem.evolution_branches.map(b => b.spirit).filter(Boolean))];
    evoTitle = need.length ? `Need at least one of: ${need.join(', ')} spirit` : 'Cannot evolve';
  } else if (!hasSp) evoTitle = `Need ${mem.spirit_req} spirit`;
  evoBtn.title = evoTitle;

  // MINT: requires instance + mintable + max level + not yet evolved (origin_state === 'saved')
  const canMint = !!inst && mem.mintable && atMax && inst.origin_state === 'saved' && !inst.is_nft;
  mintBtn.disabled  = !canMint;
  mintBtn.textContent = inst?.is_nft ? '✓ Minted' : 'Mint NFT';
  mintBtn.title = !mem.mintable ? 'Only the original captured form can be bonded on-chain' : !inst ? 'No instance' : inst.origin_state === 'evolved'
    ? 'Soul too wild to bond — must seal at captured stage'
    : !atMax ? 'Reach max level first' : inst.is_nft ? 'Already bonded' : '';
}
