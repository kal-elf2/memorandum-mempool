// TEAR EFFECTS — flight → orbs → tear-icon white flash (evo-style) + shake → burst

/** Ritual tear at rest — colored glyph + depth */
const _TEAR_FLY_FILTER_REST = 'drop-shadow(0 5px 14px rgba(0,0,0,0.38))';
/** Solid white silhouette on the flying tear only — mirrors evolution `_EVO_WHITE` */
const _TEAR_ICON_WHITE = 'brightness(0) invert(1) drop-shadow(0 0 4px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(185,235,255,0.55))';

function _tearEaseInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function _tearEaseOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function _tearMemoryAnchorPanel(panel) {
  const img = panel.querySelector('#imx-img');
  const hero = panel.querySelector('#imx-hero');
  const pr = panel.getBoundingClientRect();
  let cx = pr.width * 0.52;
  let cy = pr.height * 0.26;
  if (img && img.getBoundingClientRect().width > 4) {
    const ir = img.getBoundingClientRect();
    cx = ir.left + ir.width / 2 - pr.left;
    cy = ir.top + ir.height / 2 - pr.top;
  } else if (hero) {
    const hr = hero.getBoundingClientRect();
    cx = hr.left + hr.width * 0.52 - pr.left;
    cy = hr.top + hr.height * 0.42 - pr.top;
  }
  return { cx, cy };
}

function _tearSpriteCenterInHero(hero) {
  const hr = hero.getBoundingClientRect();
  const img = hero.querySelector('#imx-img');
  let cx = hr.width * 0.52;
  let cy = hr.height * 0.38;
  if (img && img.getBoundingClientRect().width > 4) {
    const ir = img.getBoundingClientRect();
    cx = ir.left + ir.width / 2 - hr.left;
    cy = ir.top + ir.height / 2 - hr.top;
  }
  return { cx, cy };
}

function _tearStageFillPct(panel, mem, inst, base) {
  const fill = panel.querySelector('#imx-fill');
  const sw = fill && fill.style && fill.style.width;
  if (sw && String(sw).trim().endsWith('%')) {
    const parsed = parseFloat(sw);
    if (!Number.isNaN(parsed)) return Math.min(100, Math.max(0, parsed));
  }
  const maxMC = mem.max_mc;
  const spent = typeof instanceMcSpent === 'function' ? instanceMcSpent(inst, base) : 0;
  const stageFloor = maxMC - mem.mc_needed;
  const stageProg = Math.max(0, spent - stageFloor);
  return Math.min(100, (stageProg / mem.mc_needed) * 100);
}

/** Base orb ~10% smaller than prior 13px + random variance */
function _tearSpawnOrb(layer, cx, cy, outerR) {
  const orb = document.createElement('div');
  orb.className = 'tear-energy-orb';
  const angle = Math.random() * Math.PI * 2;
  const r = outerR * (0.88 + Math.random() * 0.28);
  const sx = Math.cos(angle) * r;
  const sy = Math.sin(angle) * r;
  const basePx = 13 * 0.72;
  const sz = basePx * (0.72 + Math.random() * 0.48);
  orb.style.width = `${sz}px`;
  orb.style.height = `${sz}px`;
  orb.style.left = `${cx}px`;
  orb.style.top = `${cy}px`;
  orb.style.setProperty('--tear-sx', `${sx}px`);
  orb.style.setProperty('--tear-sy', `${sy}px`);
  const dur = 0.78 + Math.random() * 0.62;
  orb.style.animation = `tear-orb-pull ${dur}s cubic-bezier(0.48, 0.06, 0.88, 0.26) forwards`;
  layer.appendChild(orb);
  window.setTimeout(() => orb.remove(), dur * 1000 + 160);
}

function _tearOrbBarrage(layer, cx, cy, outerR, durationMs, tailDelayMs, done) {
  const t0 = performance.now();
  let prev = t0;
  let backlog = 0;

  function frame(now) {
    const u = Math.min(1, (now - t0) / durationMs);
    const dt = Math.min(0.095, (now - prev) / 1000);
    prev = now;

    /* Evolution-like orb density: modest early → flood late (longer runway than before). */
    let ratePerSec;
    if (u < 0.34) {
      const v = u / 0.34;
      ratePerSec = 1.1 + v * v * 11;
    } else if (u < 0.68) {
      const v = (u - 0.34) / 0.34;
      ratePerSec = 12.1 + Math.pow(v, 1.35) * 14;
    } else {
      const v = (u - 0.68) / 0.32;
      ratePerSec = 26.1 + Math.pow(v, 2.1) * 24;
    }

    backlog += ratePerSec * dt;
    while (backlog >= 1) {
      backlog -= 1;
      _tearSpawnOrb(layer, cx, cy, outerR);
    }

    if (u < 1) {
      requestAnimationFrame(frame);
      return;
    }
    window.setTimeout(done, tailDelayMs);
  }
  requestAnimationFrame(frame);
}

/**
 * Tear-icon-only strobing (evo phases 1→5 idea): interval shortens as charge builds,
 * then ultra-fast during climax shake — never touches #imx-img.
 */
function _tearCreateTearIconFlashRamp(tearFly, shouldCancel, rampUntilClimaxMs) {
  let mode = 'orb';
  let tStart = performance.now();
  let tClimax = null;

  let flashOn = false;
  let nextFlip = tStart;
  let raf = 0;
  let disposed = false;

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    raf = 0;
    if (tearFly && tearFly.parentElement) tearFly.style.filter = _TEAR_FLY_FILTER_REST;
  }

  function tick(now) {
    if (disposed) return;
    if (shouldCancel()) {
      dispose();
      return;
    }

    let halfPeriod;

    if (mode === 'orb') {
      const u = Math.min(1, (now - tStart) / rampUntilClimaxMs);
      /* ~360ms → ~52ms half-period over the orb / pre-shake window (evo 360→50-ish). */
      halfPeriod = 175 * (1 - Math.pow(u, 1.45) * 0.68) + 52;
    } else {
      const uc = Math.min(1, (now - tClimax) / 520);
      halfPeriod = Math.max(18, 44 - Math.pow(uc, 1.05) * 24);
    }

    if (now >= nextFlip) {
      flashOn = !flashOn;
      nextFlip = now + halfPeriod;
      tearFly.style.filter = flashOn ? _TEAR_ICON_WHITE : _TEAR_FLY_FILTER_REST;
    }

    raf = requestAnimationFrame(tick);
  }

  return {
    start() {
      tStart = performance.now();
      nextFlip = tStart;
      raf = requestAnimationFrame(tick);
    },
    beginClimax() {
      mode = 'climax';
      tClimax = performance.now();
    },
    stop: dispose,
  };
}

/** Matches `.imx-tear-fx-fly.imx-tear-fx-shake.imx-tear-shake-fast` (14 × 88ms) */
const _TEAR_CLIMAX_SHAKE_MS = 14 * 88;

function _tearClimaxBurst(fly, hero, cxH, cyH, layer, cxP, cyP, strobe, done) {
  fly.style.left = `${cxH}px`;
  fly.style.top = `${cyH}px`;
  fly.style.opacity = '1';
  fly.style.transform = '';
  fly.classList.add('imx-tear-fx-shake', 'imx-tear-shake-fast');

  if (strobe && typeof strobe.beginClimax === 'function') strobe.beginClimax();

  window.setTimeout(() => {
    fly.classList.remove('imx-tear-fx-shake', 'imx-tear-shake-fast');
    fly.style.transform = 'translate(-50%, -50%) scale(1)';
    if (strobe && typeof strobe.stop === 'function') strobe.stop();

    fly.style.opacity = '0';

    const burst = document.createElement('div');
    burst.className = 'imx-tear-fx-flash-core imx-tear-flash-core-lift';
    burst.style.left = `${cxP}px`;
    burst.style.top = `${cyP}px`;
    layer.appendChild(burst);

    const sheet = document.createElement('div');
    sheet.className = 'imx-tear-burst-sheet';
    layer.appendChild(sheet);

    const detonate = document.createElement('div');
    detonate.className = 'imx-tear-detonate-flash';
    detonate.setAttribute('aria-hidden', 'true');
    layer.appendChild(detonate);

    burst.animate(
      [
        { opacity: 0, transform: 'translate(-50%, -50%) scale(0.38)' },
        { opacity: 0.35, transform: 'translate(-50%, -50%) scale(0.85)', offset: 0.16 },
        { opacity: 0.72, transform: 'translate(-50%, -50%) scale(1.05)', offset: 0.34 },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1.28)', offset: 0.48 },
        { opacity: 0.78, transform: 'translate(-50%, -50%) scale(1.55)', offset: 0.62 },
        { opacity: 0, transform: 'translate(-50%, -50%) scale(1.95)' },
      ],
      { duration: 560, easing: 'cubic-bezier(0.18, 0.82, 0.22, 1)', fill: 'forwards' }
    );

    sheet.animate(
      [
        { opacity: 0 },
        { opacity: 0.52, offset: 0.12 },
        { opacity: 0.88, offset: 0.26 },
        { opacity: 1, offset: 0.4 },
        { opacity: 0.92, offset: 0.52 },
        { opacity: 0 },
      ],
      { duration: 560, easing: 'cubic-bezier(0.32, 0.02, 0.18, 1)', fill: 'forwards' }
    );

    detonate.animate(
      [
        { opacity: 0 },
        { opacity: 0.94, offset: 0.07 },
        { opacity: 1, offset: 0.14 },
        { opacity: 0.72, offset: 0.32 },
        { opacity: 0.35, offset: 0.52 },
        { opacity: 0 },
      ],
      { duration: 520, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards' }
    );

    window.setTimeout(() => {
      burst.remove();
      sheet.remove();
      detonate.remove();
      done();
    }, 600);
  }, _TEAR_CLIMAX_SHAKE_MS);
}

function _tearAnimateStageFill(panel, fromPct, durationMs, shouldCancel) {
  const fill = panel.querySelector('#imx-fill');
  if (!fill) return () => {};

  const start = Math.max(0, Math.min(100, fromPct));
  fill.classList.add('imx-fill--tear-anim');
  const t0 = performance.now();
  let raf = 0;

  function tick(now) {
    if (shouldCancel()) return;
    const u = Math.min(1, (now - t0) / durationMs);
    const e = _tearEaseOutCubic(u);
    const v = start + (100 - start) * e;
    fill.style.width = `${v}%`;

    if (u < 1) {
      raf = requestAnimationFrame(tick);
      return;
    }
    fill.style.width = '100%';
    fill.classList.remove('imx-fill--tear-anim');
  }

  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    fill.classList.remove('imx-fill--tear-anim');
  };
}

function _tearSmoothFlightOverMemory(fly, hero, tearBtn, opts) {
  const {
    durationMs,
    shouldCancel,
    onConsumedOne,
    onArrived,
  } = opts;

  const hr = hero.getBoundingClientRect();
  const br = tearBtn ? tearBtn.getBoundingClientRect() : null;
  const { cx, cy } = _tearSpriteCenterInHero(hero);

  const x0 = br ? br.left + br.width / 2 - hr.left : hr.width * 0.72;
  const y0 = br ? br.top + br.height / 2 - hr.top : hr.height * 0.52;

  const lift = Math.min(62, hr.height * 0.09);
  const x1 = cx;
  const y1 = cy - lift;

  fly.style.opacity = '1';
  fly.style.filter = _TEAR_FLY_FILTER_REST;

  const t0 = performance.now();
  let consumed = false;
  let raf = 0;

  function tick(now) {
    if (shouldCancel()) return;
    const t = Math.min(1, (now - t0) / durationMs);
    const e = _tearEaseInOutCubic(t);

    const bx = x0 + (x1 - x0) * e;
    const by = y0 + (y1 - y0) * e - Math.sin(Math.PI * t) * (lift * 0.5);
    const sc = 0.44 + 0.56 * e;

    fly.style.left = `${bx}px`;
    fly.style.top = `${by}px`;
    fly.style.transform = `translate(-50%, -50%) scale(${sc})`;

    if (!consumed && t >= 0.62) {
      consumed = true;
      if (typeof onConsumedOne === 'function') onConsumedOne();
    }

    if (t < 1) {
      raf = requestAnimationFrame(tick);
      return;
    }
    fly.style.left = `${x1}px`;
    fly.style.top = `${y1}px`;
    fly.classList.add('imx-tear-fly-charged');
    fly.style.transform = 'translate(-50%, -50%) scale(1)';
    if (typeof onArrived === 'function') onArrived();
  }

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

function playTearMaxLevelAnimation(panel, opts) {
  const {
    onConsumedOne,
    onApplyLevel,
    onComplete,
  } = opts || {};

  if (!panel || typeof onApplyLevel !== 'function') {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hero = panel.querySelector('#imx-hero');
  const tearBtn = panel.querySelector('#imx-tear-btn');
  const imgSrc = TEAR_ICON_SRC;

  const mem = typeof S !== 'undefined' && typeof MEMORIES !== 'undefined'
    ? MEMORIES[S.selectedId]
    : null;
  const inst = typeof currentInstance === 'function' ? currentInstance() : null;
  const base = mem?.base_memory;

  const layer = document.createElement('div');
  layer.className = 'imx-tear-fx-layer';
  panel.appendChild(layer);

  let cancelled = false;
  let cancelFlight = null;
  let cancelFill = null;
  let tearStrobe = null;

  function cleanup() {
    cancelled = true;
    if (typeof cancelFlight === 'function') cancelFlight();
    if (typeof cancelFill === 'function') cancelFill();
    if (tearStrobe && typeof tearStrobe.stop === 'function') tearStrobe.stop();
    cancelFlight = null;
    cancelFill = null;
    tearStrobe = null;
    const fly = panel.querySelector('.imx-tear-fly-ritual');
    if (fly && fly.parentElement) fly.parentElement.removeChild(fly);
    layer.remove();
    if (typeof onComplete === 'function') onComplete();
  }

  if (reduced) {
    if (typeof onConsumedOne === 'function') onConsumedOne();
    onApplyLevel();
    cleanup();
    return;
  }

  if (!hero) {
    if (typeof onConsumedOne === 'function') onConsumedOne();
    onApplyLevel();
    cleanup();
    return;
  }

  const pr = panel.getBoundingClientRect();
  const { cx: cxPanel, cy: cyPanel } = _tearMemoryAnchorPanel(panel);
  const outerSpawnR = Math.min(pr.width, pr.height) * 0.52;
  /** Orb spawn window — longer than prior pass so density can ramp like evolution. */
  const ORB_PHASE_MS = 4500;
  /** Quiet beat after last orb spawn rate ends → climax (evo-style beat before flash). */
  const ORB_TAIL_MS = 780;
  /** Tear flash ramp spans orb phase + tail until shake (interval shrinks throughout). */
  const TEAR_FLASH_RAMP_MS = ORB_PHASE_MS + ORB_TAIL_MS;
  const FILL_MS = TEAR_FLASH_RAMP_MS + 900;

  const startPct = mem && inst && base != null
    ? _tearStageFillPct(panel, mem, inst, base)
    : (parseFloat(panel.querySelector('#imx-fill')?.style?.width) || 0);

  const fly = document.createElement('img');
  fly.className = 'imx-tear-fly-ritual imx-tear-fx-fly';
  fly.src = imgSrc;
  fly.alt = '';
  hero.appendChild(fly);

  cancelFlight = _tearSmoothFlightOverMemory(fly, hero, tearBtn, {
    durationMs: 1500,
    shouldCancel: () => cancelled,
    onConsumedOne,
    onArrived: () => {
      if (cancelled) return;
      const { cx: cxH, cy: cyH } = _tearSpriteCenterInHero(hero);

      tearStrobe = _tearCreateTearIconFlashRamp(fly, () => cancelled, TEAR_FLASH_RAMP_MS);
      tearStrobe.start();

      cancelFill = _tearAnimateStageFill(panel, startPct, FILL_MS, () => cancelled);

      _tearOrbBarrage(layer, cxPanel, cyPanel, outerSpawnR, ORB_PHASE_MS, ORB_TAIL_MS, () => {
        if (cancelled) return;
        _tearClimaxBurst(fly, hero, cxH, cyH, layer, cxPanel, cyPanel, tearStrobe, () => {
          if (cancelled) return;
          tearStrobe = null;
          if (typeof cancelFill === 'function') cancelFill();
          cancelFill = null;
          const fill = panel.querySelector('#imx-fill');
          if (fill) fill.style.width = '100%';
          onApplyLevel();
          cleanup();
        });
      });
    },
  });
}
