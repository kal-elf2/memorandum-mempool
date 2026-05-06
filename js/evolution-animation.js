// EVOLUTION ANIMATION — cinematic full-screen evolution sequence (~10s)

function playEvolutionAnimation(config) {
  const {
    currentMemory, nextMemory, instance,
    spiritRequired, spiritAsset,
    primaryType, secondaryType,
    onMidpointApplyEvolution, onComplete
  } = config;

  const cGrad = CONGRATS_GRADIENTS[primaryType] || ['#38D2C4','#20B8AA'];
  const color1 = cGrad[0];
  const color2 = cGrad[1];

  const currentSprite = (instance.is_shiny ? SHINY_MAP[currentMemory.id] : IMAGE_MAP[currentMemory.id]) || IMAGE_MAP[currentMemory.id];
  const nextSprite    = (instance.is_shiny ? SHINY_MAP[nextMemory.id] : IMAGE_MAP[nextMemory.id]) || IMAGE_MAP[nextMemory.id];

  const overlay = _evoCreateOverlay(currentSprite, nextSprite, spiritAsset, color1, color2);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('active');
    _evoRunSequence(overlay, {
      currentSprite, nextSprite, spiritAsset,
      color1, color2,
      currentName: currentMemory.name,
      nextName: nextMemory.name,
      onMidpointApplyEvolution,
      onComplete
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   DOM CONSTRUCTION
   ═══════════════════════════════════════════════════════════ */
function _evoRevealBackdropHtml() {
  return `
    <div class="evo-final-backdrop" aria-hidden="true"></div>
    <div class="evo-final-vignette" aria-hidden="true"></div>
    <div class="evo-final-atmosphere" aria-hidden="true"></div>
    <div class="evo-final-rays" aria-hidden="true">
      <div class="evo-final-rays-hub">
        <div class="evo-final-rays-layer evo-final-rays-a"></div>
        <div class="evo-final-rays-layer evo-final-rays-b"></div>
      </div>
    </div>
    <div class="evo-final-column" aria-hidden="true"></div>
    <div class="evo-final-halo" aria-hidden="true"></div>
    <div class="evo-final-halo-bloom" aria-hidden="true"></div>
    <div class="evo-final-ring evo-final-ring-a" aria-hidden="true"></div>
    <div class="evo-final-ring evo-final-ring-b" aria-hidden="true"></div>
    <div class="evo-final-ground-glow" aria-hidden="true"></div>
    <div class="evo-final-particles" id="evo-reveal-particles" aria-hidden="true"></div>
  `;
}

/** Soft drifting motes — final reveal only; clustered near focal center */
function _evoRevealStartMotes(revealEl, color1, color2) {
  const host = revealEl && revealEl.querySelector('#evo-reveal-particles');
  if (!host) return;
  host.innerHTML = '';
  const n = 22;
  for (let i = 0; i < n; i++) {
    const m = document.createElement('div');
    m.className = 'evo-final-mote';
    const c = Math.random() < 0.5 ? color1 : (Math.random() < 0.7 ? color2 : '#fff');
    m.style.setProperty('--mote-c', c);
    const near = Math.random() < 0.65;
    const cx = near ? (35 + Math.random() * 30) : (8 + Math.random() * 84);
    const cy = near ? (28 + Math.random() * 32) : (6 + Math.random() * 82);
    m.style.left = `${cx}%`;
    m.style.top = `${cy}%`;
    const size = near ? (2.5 + Math.random() * 2.5) : (1.5 + Math.random() * 2);
    m.style.width = `${size}px`;
    m.style.height = `${size}px`;
    m.style.opacity = `${near ? 0.4 + Math.random() * 0.3 : 0.15 + Math.random() * 0.25}`;
    m.style.animationDelay = `${-(Math.random() * 24)}s`;
    m.style.setProperty('--mote-dur', `${12 + Math.random() * 16}s`);
    m.style.setProperty('--mote-twinkle', `${3 + Math.random() * 4}s`);
    host.appendChild(m);
  }
}

function _evoCreateOverlay(currentSrc, nextSrc, spiritSrc, color1, color2) {
  const overlay = document.createElement('div');
  overlay.className = 'evo-overlay';
  overlay.style.setProperty('--evo-color1', color1);
  overlay.style.setProperty('--evo-color2', color2);

  overlay.innerHTML = `
    <div class="evo-flash" id="evo-flash"></div>
    <div class="evo-stage" id="evo-stage">
      <div class="evo-ground" id="evo-ground"></div>
      <div class="evo-aura" id="evo-aura"></div>
      <div class="evo-column" id="evo-column"></div>
      <div class="evo-ring evo-ring-1" id="evo-ring-1"></div>
      <div class="evo-ring evo-ring-2" id="evo-ring-2"></div>
      <div class="evo-ring evo-ring-3" id="evo-ring-3"></div>
      <div class="evo-ring evo-ring-4" id="evo-ring-4"></div>
      <div class="evo-particles" id="evo-particles"></div>
      <img class="evo-sprite evo-sprite-current" id="evo-sprite-cur" src="${currentSrc}" alt="">
      <img class="evo-sprite evo-sprite-next" id="evo-sprite-next" src="${nextSrc}" alt="">
      <div class="evo-sprite-glow" id="evo-glow"></div>
      ${spiritSrc ? `<img class="evo-spirit" id="evo-spirit" src="${spiritSrc}" alt="">` : ''}
      <div class="evo-reveal" id="evo-reveal">
        ${_evoRevealBackdropHtml()}
        <div class="evo-reveal-content">
          <div class="evo-reveal-sprite-wrap">
            <img class="evo-reveal-sprite" id="evo-reveal-sprite" src="${nextSrc}" alt="">
          </div>
          <div class="evo-reveal-msg" id="evo-reveal-msg"></div>
          <button type="button" class="evo-reveal-btn" id="evo-reveal-btn">Continue</button>
        </div>
      </div>
    </div>
  `;

  return overlay;
}

/* Solid white silhouette — no detail */
const _EVO_WHITE = 'brightness(0) invert(1) drop-shadow(0 0 3px rgba(0,0,0,0.5))';

/* ═══════════════════════════════════════════════════════════
   ANIMATION SEQUENCER — ~10.5s

   Phase 1 (0–1.5s):    Energy builds, current flashes white
   Phase 2 (1.5–3.5s):  Next-stage silhouette early, orbs start
   Phase 3 (3.5–5.5s):  More orbs, column, faster alternation
   Phase 4 (5.5–7.5s):  Next dominates, heavy effects
   Phase 5 (7.5–9.2s):  White crescendo strobe
   Phase 6 (9.2s):      Flash, apply evolution
   Phase 7 (10s):       Elegant stationary reveal
   ═══════════════════════════════════════════════════════════ */
function _evoRunSequence(overlay, opts) {
  const stage      = overlay.querySelector('#evo-stage');
  const curSprite  = overlay.querySelector('#evo-sprite-cur');
  const nxtSprite  = overlay.querySelector('#evo-sprite-next');
  const glow       = overlay.querySelector('#evo-glow');
  const aura       = overlay.querySelector('#evo-aura');
  const ground     = overlay.querySelector('#evo-ground');
  const column     = overlay.querySelector('#evo-column');
  const flash      = overlay.querySelector('#evo-flash');
  const rings      = [
    overlay.querySelector('#evo-ring-1'),
    overlay.querySelector('#evo-ring-2'),
    overlay.querySelector('#evo-ring-3'),
    overlay.querySelector('#evo-ring-4'),
  ];
  const particleCt = overlay.querySelector('#evo-particles');
  const spirit     = overlay.querySelector('#evo-spirit');
  const reveal     = overlay.querySelector('#evo-reveal');
  const revealMsg  = overlay.querySelector('#evo-reveal-msg');
  const revealBtn  = overlay.querySelector('#evo-reveal-btn');

  let cancelled = false;
  let mainInterval = null;
  let orbInterval = null;
  let ringPulseInterval = null;

  function at(ms, fn) { if (!cancelled) setTimeout(fn, ms); }

  // ── Rings: spin + grow/shrink ──
  rings.forEach((r, i) => {
    r.style.animation = `${i % 2 === 0 ? 'evo-ring-spin' : 'evo-ring-spin-rev'} ${2.5 + i * 0.5}s linear infinite`;
    r.style.borderColor = i % 2 === 0 ? opts.color1 : opts.color2;
  });

  let ringScale = 1;
  let ringDir = 1;
  ringPulseInterval = setInterval(() => {
    ringScale += ringDir * 0.006;
    if (ringScale > 1.14) ringDir = -1;
    if (ringScale < 0.86) ringDir = 1;
    rings.forEach(r => { r.style.transform = `translate(-50%,-50%) scale(${ringScale})`; });
  }, 35);

  // ══════════════════════════════════════════════════════════
  // PHASE 1 (0–1500ms): Energy builds, flashing
  // ══════════════════════════════════════════════════════════
  at(150, () => { ground.style.opacity = '0.25'; });
  at(250, () => { aura.style.opacity = '0.15'; });

  let flashSpeed = 360;
  let flashOn = false;
  at(350, () => {
    mainInterval = setInterval(() => {
      flashOn = !flashOn;
      curSprite.style.filter = flashOn ? _EVO_WHITE : 'brightness(1)';
      glow.style.opacity = flashOn ? '0.45' : '0';
    }, flashSpeed);
  });

  at(500, () => { rings[0].style.opacity = '0.3'; rings[0].style.transition = 'opacity 0.4s'; });
  at(800, () => { rings[1].style.opacity = '0.25'; rings[1].style.transition = 'opacity 0.4s'; });
  at(1100, () => { rings[2].style.opacity = '0.2'; rings[2].style.transition = 'opacity 0.4s'; aura.style.opacity = '0.25'; aura.style.width = '240px'; aura.style.height = '240px'; });

  // ══════════════════════════════════════════════════════════
  // PHASE 2 (1500–3500ms): Next-stage silhouette + orbs
  // ══════════════════════════════════════════════════════════
  at(1500, () => {
    clearInterval(mainInterval); flashSpeed = 220;
    let tick = 0;
    mainInterval = setInterval(() => {
      tick++;
      const nextChance = Math.min(0.4, 0.2 + tick * 0.012);
      if (Math.random() < nextChance) {
        curSprite.style.opacity = '0';
        curSprite.style.filter = 'brightness(1)';
        nxtSprite.style.opacity = '1';
        nxtSprite.style.filter = _EVO_WHITE;
        glow.style.opacity = '0.55';
      } else {
        flashOn = !flashOn;
        nxtSprite.style.opacity = '0';
        curSprite.style.opacity = '1';
        curSprite.style.filter = flashOn ? _EVO_WHITE : 'brightness(1)';
        glow.style.opacity = flashOn ? '0.45' : '0.05';
      }
    }, flashSpeed);

    ground.style.opacity = '0.4'; ground.style.width = '380px';
    orbInterval = setInterval(() => _evoSpawnOrb(particleCt, opts.color1, opts.color2), 250);
  });

  at(2000, () => { _evoSpawnBurst(particleCt, opts.color2, 8); });
  at(2500, () => { aura.style.opacity = '0.35'; aura.style.width = '270px'; aura.style.height = '270px'; });
  at(3000, () => { _evoSpawnBurst(particleCt, opts.color1, 10); rings[3].style.opacity = '0.15'; rings[3].style.transition = 'opacity 0.4s'; });

  // ══════════════════════════════════════════════════════════
  // SPIRIT — dramatic fly-through (if required)
  // Starts at 3s, flies behind → across → gets HUGE at screen → rushes back in
  // Lasts 3s, merges ~6s mark with a burst
  // ══════════════════════════════════════════════════════════
  if (spirit) {
    at(3000, () => {
      spirit.style.opacity = '1';
      spirit.style.animation = 'evo-spirit-fly 3000ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards';
    });
    // Spirit merge burst — when it dives back into the center
    at(5800, () => {
      _evoSpawnBurst(particleCt, opts.color1, 18);
      _evoSpawnBurst(particleCt, '#fff', 10);
      aura.style.opacity = '0.6';
      aura.style.width = '340px'; aura.style.height = '340px';
    });
  }

  // ══════════════════════════════════════════════════════════
  // PHASE 3 (3500–5500ms): Faster, more orbs, column
  // ══════════════════════════════════════════════════════════
  at(3500, () => {
    clearInterval(mainInterval); flashSpeed = 160;
    let tick = 0;
    mainInterval = setInterval(() => {
      tick++;
      const nextChance = Math.min(0.55, 0.3 + tick * 0.015);
      if (Math.random() < nextChance) {
        curSprite.style.opacity = '0';
        curSprite.style.filter = 'brightness(1)';
        nxtSprite.style.opacity = '1';
        nxtSprite.style.filter = _EVO_WHITE;
        glow.style.opacity = '0.65';
      } else {
        nxtSprite.style.opacity = '0';
        curSprite.style.opacity = '1';
        curSprite.style.filter = _EVO_WHITE;
        glow.style.opacity = '0.5';
      }
    }, flashSpeed);

    clearInterval(orbInterval);
    orbInterval = setInterval(() => _evoSpawnOrb(particleCt, opts.color1, opts.color2), 150);
    column.style.opacity = '0.3'; column.style.height = '400px'; column.style.width = '35px';
  });

  at(4000, () => { _evoSpawnBurst(particleCt, opts.color1, 12); });
  at(4500, () => {
    clearInterval(orbInterval);
    orbInterval = setInterval(() => _evoSpawnOrb(particleCt, opts.color1, opts.color2), 110);
    column.style.height = '550px'; column.style.opacity = '0.45'; column.style.width = '42px';
    aura.style.opacity = '0.55'; aura.style.width = '310px'; aura.style.height = '310px';
    rings.forEach(r => { r.style.opacity = '0.4'; r.style.borderWidth = '3px'; });
  });

  at(5000, () => { _evoSpawnBurst(particleCt, '#fff', 12); stage.style.animation = 'evo-shake 0.35s ease infinite'; });

  // ══════════════════════════════════════════════════════════
  // PHASE 4 (5500–7500ms): Next dominates, energy peaks
  // ══════════════════════════════════════════════════════════
  at(5500, () => {
    clearInterval(mainInterval); flashSpeed = 100;
    let tick = 0;
    mainInterval = setInterval(() => {
      tick++;
      const nextChance = Math.min(0.8, 0.5 + tick * 0.02);
      if (Math.random() < nextChance) {
        curSprite.style.opacity = '0';
        nxtSprite.style.opacity = '1';
        nxtSprite.style.filter = _EVO_WHITE;
      } else {
        nxtSprite.style.opacity = '0';
        curSprite.style.opacity = '1';
        curSprite.style.filter = _EVO_WHITE;
      }
      glow.style.opacity = '0.75';
    }, flashSpeed);

    clearInterval(orbInterval);
    orbInterval = setInterval(() => _evoSpawnOrb(particleCt, opts.color1, opts.color2), 80);
    column.style.height = '750px'; column.style.opacity = '0.6'; column.style.width = '52px';
    stage.style.animation = 'evo-shake-heavy 0.28s ease infinite';
    rings.forEach(r => { r.style.opacity = '0.6'; r.style.borderWidth = '4px'; });
    ground.style.opacity = '0.8'; ground.style.width = '600px';
  });

  at(6000, () => { _evoSpawnBurst(particleCt, opts.color1, 16); });
  at(6500, () => { _evoSpawnBurst(particleCt, '#fff', 14); aura.style.opacity = '0.8'; aura.style.width = '380px'; aura.style.height = '380px'; });
  at(7000, () => { _evoSpawnBurst(particleCt, opts.color2, 16); ground.style.opacity = '1'; ground.style.width = '700px'; });

  // ══════════════════════════════════════════════════════════
  // PHASE 5 (7500–9200ms): White crescendo
  // ══════════════════════════════════════════════════════════
  at(7500, () => {
    clearInterval(mainInterval);
    clearInterval(orbInterval);

    flashSpeed = 50;
    mainInterval = setInterval(() => {
      flashOn = !flashOn;
      curSprite.style.opacity = '0';
      nxtSprite.style.opacity = flashOn ? '1' : '0';
      nxtSprite.style.filter = _EVO_WHITE;
      glow.style.opacity = flashOn ? '1' : '0.6';
    }, flashSpeed);

    column.style.opacity = '1'; column.style.width = '75px'; column.style.height = '1100px';
    aura.style.opacity = '1'; aura.style.width = '480px'; aura.style.height = '480px';
    _evoSpawnBurst(particleCt, '#fff', 22);
  });

  at(7900, () => { _evoSpawnBurst(particleCt, opts.color1, 18); });
  at(8300, () => { _evoSpawnBurst(particleCt, '#fff', 20); });

  at(8700, () => {
    clearInterval(mainInterval);
    curSprite.style.opacity = '0';
    nxtSprite.style.opacity = '0';
    glow.style.opacity = '1';
    overlay.style.background = 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, #000 60%)';
  });

  at(9000, () => { _evoSpawnBurst(particleCt, '#fff', 24); });

  // ══════════════════════════════════════════════════════════
  // PHASE 6 (9200ms): Flash — apply evolution
  // ══════════════════════════════════════════════════════════
  at(9200, () => {
    flash.classList.add('fire');
    stage.style.animation = '';
    clearInterval(ringPulseInterval);
    if (opts.onMidpointApplyEvolution) opts.onMidpointApplyEvolution();
  });

  // ══════════════════════════════════════════════════════════
  // PHASE 7 (10000ms): Elegant stationary reveal
  // ══════════════════════════════════════════════════════════
  at(10000, () => {
    flash.classList.remove('fire');
    flash.classList.add('fade');

    glow.style.opacity = '0';
    aura.style.opacity = '0';
    column.style.opacity = '0';
    ground.style.opacity = '0';
    rings.forEach(r => { r.style.opacity = '0'; });
    particleCt.innerHTML = '';
    curSprite.style.opacity = '0';
    nxtSprite.style.opacity = '0';
    overlay.style.background = 'radial-gradient(ellipse at center, #060612 0%, #000 100%)';

    revealMsg.textContent = `${opts.currentName} evolved into ${opts.nextName}!`;
    reveal.classList.add('show');
    _evoRevealStartMotes(reveal, opts.color1, opts.color2);
  });

  // ── Continue ──
  revealBtn.onclick = () => {
    cancelled = true;
    clearInterval(mainInterval);
    clearInterval(orbInterval);
    clearInterval(ringPulseInterval);
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.remove();
      if (opts.onComplete) opts.onComplete();
    }, 500);
  };
}

/* ═══════════════════════════════════════════════════════════
   ENERGY ORB — type-colored, converges to center
   ═══════════════════════════════════════════════════════════ */
function _evoSpawnOrb(container, color1, color2) {
  const orb = document.createElement('div');
  orb.className = 'evo-orb';

  const angle = Math.random() * Math.PI * 2;
  const dist = 200 + Math.random() * 180;
  const sx = Math.cos(angle) * dist;
  const sy = Math.sin(angle) * dist;

  orb.style.left = '50%'; orb.style.top = '50%';
  orb.style.setProperty('--orb-sx', `${sx}px`);
  orb.style.setProperty('--orb-sy', `${sy}px`);

  const useColor = Math.random() > 0.5 ? color1 : color2;
  orb.style.background = `radial-gradient(circle, #fff 15%, ${useColor} 100%)`;
  orb.style.boxShadow = `0 0 10px 4px ${useColor}`;
  const size = 8 + Math.random() * 12;
  orb.style.width = `${size}px`;
  orb.style.height = `${size}px`;
  orb.style.animation = `evo-orb-converge ${0.6 + Math.random() * 0.5}s ease-in forwards`;

  container.appendChild(orb);
  setTimeout(() => orb.remove(), 1300);
}

/* ═══════════════════════════════════════════════════════════
   PARTICLE BURST
   ═══════════════════════════════════════════════════════════ */
function _evoSpawnBurst(container, color, count) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'evo-particle';
    p.style.background = color;
    p.style.left = '50%'; p.style.top = '50%';
    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5 - 0.25);
    const dist = 70 + Math.random() * 130;
    p.style.setProperty('--px', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--py', `${Math.sin(angle) * dist}px`);
    const size = 3 + Math.random() * 5;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.animation = `evo-particle-fly ${0.5 + Math.random() * 0.5}s ease-out forwards`;
    p.style.animationDelay = `${Math.random() * 0.12}s`;
    container.appendChild(p);
    setTimeout(() => p.remove(), 1300);
  }
}
