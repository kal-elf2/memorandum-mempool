// RENDER — grid rendering, card generation, type views

// ══════════════════════════════════════════════════════════════
//  RENDER GRID
// ══════════════════════════════════════════════════════════════
const TYPE_ORDER = ['EARTH','FIRE','WIND','WATER','ELECTRIC','SOUL','AETHER','VOID','MIND','ASTRAL'];

function renderCard(id, ownedIds) {
  const cat       = CATALOG[id];
  const insts     = instancesFor(id);
  const hasShiny  = insts.some(i => i.is_shiny);
  const bonded    = S.mode === 'bonded';

  if (bonded) {
    const everBonded   = !!S.bondedLog[id];
    const activeBonded = insts.some(i => i.is_nft);
    if (everBonded && cat) {
      const src = (insts[0]?.is_shiny ? SHINY_MAP[id] : IMAGE_MAP[id]) || IMAGE_MAP[id];
      const img = src
        ? `<img class="gc-img" src="${src}" alt="${cat.name}" loading="lazy">`
        : `<div class="gc-placeholder"></div>`;
      const chainCls = activeBonded ? 'active' : 'history';
      const nftCount = insts.filter(i => i.is_nft).length;
      const badge = `<span class="gc-count"><span class="gc-chain ${chainCls}">⬡</span>${nftCount > 0 ? nftCount : ''}</span>`;
      return `<div class="grid-cell known${hasShiny?' akronite':''}" data-dex-id="${id}" onclick="openDetail('${id}')">
        <span class="gc-num">${id}</span>
        ${img}
        <span class="gc-name">${cat.name}</span>
        ${badge}
      </div>`;
    }
    return `<div class="grid-cell" data-dex-id="${id}">
      <span class="gc-num-unk">${id}</span>
    </div>`;
  }

  // Memories mode
  const owned     = ownedIds.includes(id);
  const everOwned = !!S.owned[id];
  const seen      = !!S.seen[id];

  if ((owned || everOwned) && cat) {
    const src = (insts[0]?.is_shiny ? SHINY_MAP[id] : IMAGE_MAP[id]) || IMAGE_MAP[id];
    const img = src
      ? `<img class="gc-img" src="${src}" alt="${cat.name}" loading="lazy">`
      : `<div class="gc-placeholder"></div>`;
    const countBadge = insts.length > 0
      ? `<span class="gc-count">${insts.length}</span>`
      : '';
    return `<div class="grid-cell known${hasShiny?' akronite':''}" data-dex-id="${id}" onclick="openDetail('${id}')">
      <span class="gc-num">${id}</span>
      ${img}
      <span class="gc-name">${cat.name}</span>
      ${countBadge}
    </div>`;
  } else if (seen && cat) {
    const src = IMAGE_MAP[id];
    const imgEl = src
      ? `<div class="gc-img-discovered-wrap"><img class="gc-img-discovered" src="${src}" alt="" loading="lazy"></div>`
      : `<div class="gc-placeholder"></div>`;
    return `<div class="grid-cell seen" data-dex-id="${id}">
      <span class="gc-num">${id}</span>
      ${imgEl}
      <span class="gc-seen-placeholder">???</span>
    </div>`;
  } else {
    return `<div class="grid-cell" data-dex-id="${id}">
      <span class="gc-num-unk">${id}</span>
    </div>`;
  }
}

function buildTypeIconRow() {
  const row = document.getElementById('type-icon-row');
  if (!row) return;
  row.innerHTML = TYPE_ORDER.map(t => {
    const icon = TYPE_ICON_MAP[t];
    return `<button class="type-icon-btn" id="type-btn-${t.toLowerCase()}"
        onclick="scrollToType('${t}')" title="${t}">
      <img src="assets/icons/${icon}.png" alt="${t}"
           onerror="this.style.display='none'">
    </button>`;
  }).join('');
}

function scrollToType(type) {
  document.querySelectorAll('.type-icon-btn').forEach(b => b.classList.remove('active-type'));
  const iconBtn = document.getElementById(`type-btn-${type.toLowerCase()}`);
  if (iconBtn) iconBtn.classList.add('active-type');

  const section = document.getElementById(`type-section-${type.toLowerCase()}`);
  const cells = document.getElementById('grid-cells');
  const sg = document.getElementById('screen-grid');
  if (!section || !cells || !sg) return;

  const headRow = section.querySelector('.type-section-header');
  const anchor = headRow || section;

  const pad = 10;
  const runScroll = () => {
    const cRect = cells.getBoundingClientRect();
    const aRect = anchor.getBoundingClientRect();
    const nextTop = aRect.top - cRect.top + cells.scrollTop - pad;
    cells.scrollTo({ top: Math.max(0, nextTop), behavior: 'auto' });
    syncCardRows();
    requestAnimationFrame(() => syncCardRows());
  };

  window._gridTypeScrollSuppressUntil = Date.now() + 900;

  const alreadyCollapsed = sg.classList.contains('grid-expanded');
  if (!alreadyCollapsed) {
    toggleGridExpand(true);
    setTimeout(runScroll, 560);
  } else {
    runScroll();
  }
}

function renderTypeView(q, ownedIds) {
  return TYPE_ORDER.map(type => {
    const typeIds = Object.entries(CATALOG)
      .filter(([id, cat]) => cat.primary === type)
      .map(([id]) => id)
      .sort((a, b) => parseInt(a) - parseInt(b));

    let filtered = typeIds;
    if (q) {
      filtered = typeIds.filter(id => {
        const cat = CATALOG[id];
        const name = (cat?.name || '').toLowerCase();
        return id.includes(q) || name.includes(q);
      });
    }
    if (!filtered.length) return '';

    const savedCount = filtered.filter(id => ownedIds.includes(id)).length;
    const totalCount = filtered.length;
    const pct = totalCount > 0 ? Math.round((savedCount / totalCount) * 100) : 0;
    const pColor = typePrimary(type);
    const cg = CONGRATS_GRADIENTS[type] || ['#888','#aaa'];
    const icon = TYPE_ICON_MAP[type];

    const cards = filtered.map(id => renderCard(id, ownedIds)).join('');

    return `<div class="type-section" id="type-section-${type.toLowerCase()}">
      <div class="type-section-header">
        <img class="type-sec-icon" src="assets/icons/${icon}.png" alt="${type}"
             onerror="this.style.display='none'">
        <div class="type-sec-info">
          <span class="type-sec-name" style="color:${pColor}">${type}</span>
          <span class="type-sec-progress">${savedCount} / ${totalCount} ${S.mode === 'bonded' ? 'Bonded' : 'Saved'}</span>
        </div>
        <div class="type-sec-bar-zone">
          <span class="type-sec-bar-label">${S.mode === 'bonded' ? 'Bond Progress' : 'Save Progress'}</span>
          <div class="type-sec-bar-wrap">
            <div class="type-sec-bar" style="width:${pct}%;background:linear-gradient(to right,${cg[0]},${cg[1]})"></div>
          </div>
        </div>
      </div>
      <div class="type-section-grid">${cards}</div>
    </div>`;
  }).join('');
}

// Measures actual column width after layout; row height = width × (rowPct/100).
function syncCardRows(retry) {
  const attempt = typeof retry === 'number' ? retry : 0;
  requestAnimationFrame(() => {
    const grid = document.getElementById('grid-cells');
    if (!grid) return;
    const typeMode = grid.classList.contains('type-mode');
    const gridVisible = document.getElementById('screen-grid')?.classList.contains('active');

    const firstCard = grid.querySelector('.grid-cell');
    if (!firstCard) return;

    const rawMul = (typeof CT !== 'undefined' && CT.rowPct != null) ? CT.rowPct / 100 : 1;
    const mul = Number.isFinite(rawMul) && rawMul > 0 ? rawMul : 1;

    const w = Math.round(firstCard.getBoundingClientRect().width);

    if (gridVisible && w <= 0 && attempt < 14) {
      syncCardRows(attempt + 1);
      return;
    }

    if (!typeMode) {
      if (w > 0) {
        const h = Math.max(40, Math.min(240, Math.round(w * mul)));
        grid.style.gridAutoRows = h + 'px';
      } else {
        grid.style.removeProperty('grid-auto-rows');
      }
    } else {
      grid.style.removeProperty('grid-auto-rows');
    }

    let sectionNeedsRetry = false;
    document.querySelectorAll('.type-section-grid').forEach(tg => {
      const tc = tg.querySelector('.grid-cell');
      if (!tc) return;
      const tw = Math.round(tc.getBoundingClientRect().width);
      if (tw > 0) {
        const th = Math.max(40, Math.min(240, Math.round(tw * mul)));
        tg.style.gridAutoRows = th + 'px';
      } else {
        tg.style.removeProperty('grid-auto-rows');
        if (gridVisible) sectionNeedsRetry = true;
      }
    });

    if (gridVisible && sectionNeedsRetry && attempt < 14) {
      syncCardRows(attempt + 1);
    }
  });
}
window.addEventListener('resize', () => syncCardRows(0));

function renderGrid() {
  const q        = (document.getElementById('grid-q')?.value || '').toLowerCase().trim();
  const f        = S.filter;
  const bonded   = S.mode === 'bonded';
  const ownedIds = [...new Set([...S.instances.map(i => i.dex_id), ...Object.keys(S.owned)])];
  const bondedLogIds  = Object.keys(S.bondedLog);
  const activeBondIds = [...new Set(S.instances.filter(i => i.is_nft).map(i => i.dex_id))];

  const seenCount   = Object.keys(S.seen).length;
  const savedCount  = ownedIds.length;
  const bondedCount = bondedLogIds.length;
  document.getElementById('grid-pill-disc').textContent   = `${seenCount} Discovered`;
  document.getElementById('grid-pill-inst').textContent   = `${savedCount} Saved`;
  document.getElementById('grid-pill-bonded').textContent = `${bondedCount} Bonded`;

  const effectiveOwned = bonded ? bondedLogIds : ownedIds;

  const cellsEl = document.getElementById('grid-cells');
  cellsEl.classList.toggle('type-mode', f === 'type');

  if (f === 'type') {
    cellsEl.innerHTML = renderTypeView(q, effectiveOwned);
    syncCardRows();
    syncDevInventoryBar();
    return;
  }

  const akroniteIds = bonded
    ? [...new Set(S.instances.filter(i => i.is_nft && i.is_shiny).map(i => i.dex_id))]
    : [...new Set(S.instances.filter(i => i.is_shiny).map(i => i.dex_id))];

  const all = Array.from({length:144}, (_,i) => String(i+1).padStart(3,'0'));
  const ids = all.filter(id => {
    const cat  = CATALOG[id];
    const name = (cat?.name || '').toLowerCase();
    if (q && !id.includes(q) && !name.includes(q)) return false;
    if (f === 'saved'    && !effectiveOwned.includes(id)) return false;
    if (f === 'akronite' && !akroniteIds.includes(id))    return false;
    return true;
  });

  if (!ids.length && (f === 'saved' || f === 'akronite')) {
    const label = f === 'akronite' ? 'Akronite' : (bonded ? 'Bonded' : 'Saved');
    cellsEl.innerHTML = `<div style="text-align:center;padding:48px 20px;color:var(--text-muted);font-size:13px;line-height:1.6">
      <div style="font-size:22px;margin-bottom:8px;opacity:0.4">${f === 'akronite' ? '★' : '⬡'}</div>
      No ${label} memories yet
    </div>`;
    syncCardRows();
    syncDevInventoryBar();
    return;
  }

  cellsEl.innerHTML = ids.map(id => renderCard(id, effectiveOwned)).join('');
  syncCardRows();
  if (window._updateScrollThumb) requestAnimationFrame(window._updateScrollThumb);
  syncDevInventoryBar();
}

/**
 * Memories / All, expanded grid scroll; empty pill vs full card flash on target dex.
 * Waits for header collapse (grid-template-rows transition) before scrolling so row heights
 * and scroll targets stay stable; avoids syncCardRows during smooth scroll (was causing stick).
 */
function navigateGridAfterCongratsReveal(dexId) {
  const nid = dexId != null && /^\d+$/.test(String(dexId))
    ? String(dexId).padStart(3, '0')
    : String(dexId ?? '');
  showScreen('grid');
  if (S.mode !== 'memories') {
    const memBtn = document.querySelector('.mode-tab[data-mode="memories"]');
    if (memBtn) setMode(memBtn);
  } else {
    S.filter = 'all';
    document.querySelectorAll('.ftab').forEach(t => t.classList.toggle('active', t.dataset.f === 'all'));
    renderGrid();
  }

  const sg = document.getElementById('screen-grid');
  const expandedJustNow = !!(sg && !sg.classList.contains('grid-expanded'));
  if (expandedJustNow) toggleGridExpand(true);
  window._gridTypeScrollSuppressUntil = Date.now() + (expandedJustNow ? 2800 : 1400);

  let kicked = false;
  function kickScrollReveal() {
    if (kicked) return;
    kicked = true;
    requestAnimationFrame(() => requestAnimationFrame(runScrollReveal));
  }

  const hz = document.getElementById('header-zone');
  if (expandedJustNow && hz) {
    const onGridTransitionEnd = (e) => {
      if (e.target !== hz || e.propertyName !== 'grid-template-rows') return;
      hz.removeEventListener('transitionend', onGridTransitionEnd);
      kickScrollReveal();
    };
    hz.addEventListener('transitionend', onGridTransitionEnd);
    window.setTimeout(() => {
      hz.removeEventListener('transitionend', onGridTransitionEnd);
      kickScrollReveal();
    }, 750);
  } else {
    window.setTimeout(kickScrollReveal, 72);
  }

  function runScrollReveal() {
    const cells = document.getElementById('grid-cells');
    const cell = cells?.querySelector(`.grid-cell[data-dex-id="${nid}"]`);
    if (!cells || !cell) return;

    const pad = 18;
    const reduced = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    syncCardRows(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const targetTop = Math.max(0, cell.offsetTop - pad);
        cells.scrollTo({ top: targetTop, behavior: reduced ? 'auto' : 'smooth' });

        let pulseStarted = false;
        function startRevealPulse() {
          if (pulseStarted) return;
          pulseStarted = true;

          if (!cell.classList.contains('known')) return;

          cell.classList.add('gc-dex-reveal-mode');

          const underlay = document.createElement('div');
          underlay.className = 'gc-dex-reveal-underlay';
          underlay.setAttribute('aria-hidden', 'true');
          underlay.innerHTML = `<span class="gc-num-unk">${nid}</span>`;

          const cardLayer = document.createElement('div');
          cardLayer.className = 'gc-dex-reveal-card-layer';

          while (cell.firstChild) cardLayer.appendChild(cell.firstChild);

          cell.appendChild(underlay);
          cell.appendChild(cardLayer);

          const finish = () => {
            if (!cardLayer.parentNode) return;
            while (cardLayer.firstChild) cell.appendChild(cardLayer.firstChild);
            underlay.remove();
            cardLayer.remove();
            cell.classList.remove('gc-dex-reveal-mode');
            syncCardRows(0);
            requestAnimationFrame(() => syncCardRows(0));
          };

          if (reduced) cardLayer.classList.add('gc-dex-reveal-card-layer--reduced');

          cardLayer.addEventListener('animationend', finish, { once: true });
          window.setTimeout(finish, reduced ? 450 : 3100);
        }

        const fallbackMs = reduced ? 120 : (expandedJustNow ? 820 : 340);
        if (!reduced && typeof cells.addEventListener === 'function') {
          cells.addEventListener('scrollend', () => startRevealPulse(), { once: true });
        }
        window.setTimeout(() => startRevealPulse(), fallbackMs);

        window.setTimeout(() => {
          syncCardRows(0);
          if (window._updateScrollThumb) requestAnimationFrame(window._updateScrollThumb);
        }, fallbackMs + 100);
      });
    });
  }
}
