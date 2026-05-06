// TUNER SYSTEM — developer-only panels for adjusting layout values in real-time

/** Persisted in dev: whether floating layout tuner panels are visible at all */
const _DEV_LAYOUT_TUNERS_LS = 'mempoolDevShowLayoutTuners';

function isDevLayoutTunersEnabled() {
  if (typeof window !== 'undefined' && window.__MEMPOOL_PRODUCTION__) return false;
  try {
    const v = localStorage.getItem(_DEV_LAYOUT_TUNERS_LS);
    if (v === null || v === '') return false;
    return v === '1' || v === 'true';
  } catch (_) {
    return false;
  }
}

function setDevLayoutTunersEnabled(enabled) {
  try {
    localStorage.setItem(_DEV_LAYOUT_TUNERS_LS, enabled ? '1' : '0');
  } catch (_) {}
  applyDevLayoutTunersPreferenceToDom();
}

/** Toggle html class + checkbox; refresh screen-specific tuner display rules */
function applyDevLayoutTunersPreferenceToDom() {
  const on = isDevLayoutTunersEnabled();
  document.documentElement.classList.toggle('dev-layout-tuners-hidden', !on);
  const cb = document.getElementById('dev-show-layout-tuners');
  if (cb && cb.type === 'checkbox') cb.checked = on;
  if (typeof syncDevPanelVisibility === 'function') {
    const scr = window.__lastDevSyncScreen;
    syncDevPanelVisibility(scr != null ? scr : 'grid');
  }
}

// ══════════════════════════════════════════════════════════════
//  POSITION TUNER
// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
//  CONGRATS LAYOUT TUNER  (screen-area values baked into CSS)
// ══════════════════════════════════════════════════════════════
const PT = {
  cgStripTop:    24,
  cgStripBot:    38,
  cgCreatureTop: 13,
  cgCreatureSz:  368,
  cgTagsTop:     48,
  cgTxtTop:      48,
  cgCloseL:      32,
  cgCloseT:      144,
  cgCloseSz:     38,
  cgBtnR:        66,
  cgBtnT:        608,
  cgBtnPx:       46,
  cgBtnPy:       14,
  cgBtnFs:       14,
  cgBtnMinW:     197,
  cgBtnW:        0,
  cgBtnH:        0,
  cgWmFs:        168,
  cgWmScale:     130,
  cgWmX:         0,
  cgWmY:         32,
  cgWmOp:        8,
  cgRwX:         50,
  cgRwY:         47,
  cgEssFs:       29,
  cgEssNumFs:    29,
  cgEssGap:      5,
  cgEssDx:       0,
  cgEssDy:       0,
  cgMcFs:        27,
  cgMcDx:        0,
  cgMcDy:        0,
  cgWowFs:       20,
  cgWowDx:       0,
  cgWowDy:       6,
  cgBandOp:      63,
  cgBandFadeS:   28,
  cgBandFadeE:   100,
  cgGlowSz:      30,
  cgGlowOp:      50,
  cgGlowSolid:   10,
  cgGlowGone:    100,
};

const PT_CG = [
  { col:1, sec:'Gradient band', key:'cgStripTop',    label:'Top',    unit:'%', step:1, min:0, max:90, cssVar:'--cg-strip-top',    cssSuffix:'%' },
  { col:1, key:'cgStripBot',    label:'Bottom', unit:'%', step:1, min:0, max:90, cssVar:'--cg-strip-bot',    cssSuffix:'%' },
  { col:1, key:'cgBandOp',      label:'Band α', unit:'%', step:2, min:5, max:100, cssVar:'__skip', cssSuffix:'%' },
  { col:1, key:'cgBandFadeS',   label:'Fade start', unit:'%', step:2, min:0, max:100, cssVar:'__skip', cssSuffix:'%' },
  { col:1, key:'cgBandFadeE',   label:'Fade end', unit:'%', step:2, min:0, max:100, cssVar:'__skip', cssSuffix:'%' },
  { col:1, sec:'Edge glow', key:'cgGlowSz', label:'Height', unit:'px', step:2, min:4, max:100, cssVar:'--cg-glow-sz', cssSuffix:'px' },
  { col:1, key:'cgGlowOp',     label:'Bright', unit:'%', step:2, min:5, max:100, cssVar:'__skip', cssSuffix:'%' },
  { col:1, key:'cgGlowSolid',  label:'Solid %', unit:'%', step:2, min:0, max:80, cssVar:'--cg-glow-solid', cssSuffix:'%' },
  { col:1, key:'cgGlowGone',   label:'Gone %', unit:'%', step:2, min:20, max:100, cssVar:'--cg-glow-gone', cssSuffix:'%' },
  { col:2, sec:'Creature art', key:'cgCreatureTop', label:'Y', unit:'%', step:1, min:0, max:85, cssVar:'--cg-creature-top', cssSuffix:'%' },
  { col:2, key:'cgCreatureSz',  label:'Size', unit:'px', step:4, min:120, max:480, cssVar:'--cg-creature-sz', cssSuffix:'px' },
  { col:3, sec:'Name WM', key:'cgWmFs', label:'WM px', unit:'px', step:2, min:20, max:280, cssVar:'--cg-wm-fs', cssSuffix:'px' },
  { col:3, key:'cgWmScale', label:'WM scale', unit:'%', step:5, min:40, max:240, cssVar:'__skip', cssSuffix:'%' },
  { col:3, key:'cgWmX', label:'WM X', unit:'px', step:2, min:-400, max:400, cssVar:'--cg-wm-x', cssSuffix:'px' },
  { col:3, key:'cgWmY', label:'WM Y', unit:'px', step:2, min:-400, max:400, cssVar:'--cg-wm-y', cssSuffix:'px' },
  { col:3, key:'cgWmOp', label:'WM α %', unit:'%', step:1, min:2, max:45, cssVar:'__skip', cssSuffix:'%' },
  { col:4, sec:'Tags row', key:'cgTagsTop', label:'Y', unit:'%', step:1, min:0, max:90, cssVar:'--cg-tags-top', cssSuffix:'%' },
  { col:4, sec:'Text block', key:'cgTxtTop', label:'Y', unit:'%', step:1, min:0, max:90, cssVar:'--cg-txt-top', cssSuffix:'%' },
  { col:4, sec:'Close ×', key:'cgCloseL', label:'Left', unit:'px', step:2, min:0, max:160, cssVar:'--cg-close-l', cssSuffix:'px' },
  { col:4, key:'cgCloseT', label:'Top', unit:'px', step:2, min:0, max:200, cssVar:'--cg-close-t', cssSuffix:'px' },
  { col:4, key:'cgCloseSz', label:'Size', unit:'px', step:2, min:28, max:56, cssVar:'--cg-close-sz', cssSuffix:'px' },
  { col:5, sec:'Mempool btn', key:'cgBtnR', label:'From right', unit:'px', step:2, min:0, max:200, cssVar:'--cg-btn-r', cssSuffix:'px' },
  { col:5, key:'cgBtnT', label:'Top', unit:'px', step:4, min:0, max:900, cssVar:'--cg-btn-t', cssSuffix:'px' },
  { col:5, key:'cgBtnPx', label:'Pad X', unit:'px', step:2, min:8, max:80, cssVar:'--cg-btn-px', cssSuffix:'px' },
  { col:5, key:'cgBtnPy', label:'Pad Y', unit:'px', step:2, min:6, max:48, cssVar:'--cg-btn-py', cssSuffix:'px' },
  { col:6, key:'cgBtnFs', label:'Font', unit:'px', step:1, min:10, max:22, cssVar:'--cg-btn-fs', cssSuffix:'px' },
  { col:6, key:'cgBtnMinW', label:'Min wide', unit:'px', step:4, min:80, max:320, cssVar:'--cg-btn-minw', cssSuffix:'px' },
  { col:6, key:'cgBtnW', label:'Wide 0=auto', unit:'px', step:4, min:0, max:360, cssVar:'__skip', cssSuffix:'px' },
  { col:6, key:'cgBtnH', label:'High 0=auto', unit:'px', step:2, min:0, max:80, cssVar:'__skip', cssSuffix:'px' },
  { col:7, sec:'Reward zone', key:'cgRwX', label:'Right', unit:'px', step:2, min:0, max:200, cssVar:'--cg-rw-x', cssSuffix:'px' },
  { col:7, key:'cgRwY', label:'Y', unit:'%', step:1, min:0, max:90, cssVar:'--cg-rw-y', cssSuffix:'%' },
  { col:7, sec:'Essence', key:'cgEssFs', label:'Word sz', unit:'px', step:1, min:10, max:60, cssVar:'--cg-ess-fs', cssSuffix:'px' },
  { col:7, key:'cgEssNumFs', label:'Num sz', unit:'px', step:1, min:10, max:80, cssVar:'--cg-ess-num-fs', cssSuffix:'px' },
  { col:7, key:'cgEssGap', label:'Gap', unit:'px', step:1, min:0, max:30, cssVar:'--cg-ess-gap', cssSuffix:'px' },
  { col:7, key:'cgEssDx', label:'X', unit:'px', step:2, min:-200, max:200, cssVar:'--cg-ess-dx', cssSuffix:'px' },
  { col:7, key:'cgEssDy', label:'Y', unit:'px', step:2, min:-200, max:200, cssVar:'--cg-ess-dy', cssSuffix:'px' },
  { col:8, sec:'Memcore +◆', key:'cgMcFs', label:'Size', unit:'px', step:1, min:8, max:40, cssVar:'--cg-mc-fs', cssSuffix:'px' },
  { col:8, key:'cgMcDx', label:'X', unit:'px', step:2, min:-200, max:200, cssVar:'--cg-mc-dx', cssSuffix:'px' },
  { col:8, key:'cgMcDy', label:'Y', unit:'px', step:2, min:-200, max:200, cssVar:'--cg-mc-dy', cssSuffix:'px' },
  { col:8, sec:'Wow pill', key:'cgWowFs', label:'Size', unit:'px', step:1, min:8, max:30, cssVar:'--cg-wow-fs', cssSuffix:'px' },
  { col:8, key:'cgWowDx', label:'X', unit:'px', step:2, min:-200, max:200, cssVar:'--cg-wow-dx', cssSuffix:'px' },
  { col:8, key:'cgWowDy', label:'Y', unit:'px', step:2, min:-200, max:200, cssVar:'--cg-wow-dy', cssSuffix:'px' },
];

// ══════════════════════════════════════════════════════════════
//  MOBILE CONGRATS LAYOUT TUNER  (≤720px only; --cg-m-* on overlay)
// ══════════════════════════════════════════════════════════════
const _DEV_CG_MOBILE_LS = 'mempoolCgMobilePT';

const PT_M_DEFAULTS = {
  cgStripTop: 16,
  cgStripBot: 39,
  cgBandOp: 63,
  cgBandFadeS: 28,
  cgBandFadeE: 100,
  cgGlowSz: 30,
  cgGlowOp: 50,
  cgGlowSolid: 10,
  cgGlowGone: 100,
  cgCreatureTop: 14,
  cgCreatureSz: 292,
  cgWmFsMin: 64,
  cgWmFsMax: 168,
  cgWmScale: 130,
  cgWmX: 0,
  cgWmY: 44,
  cgWmOp: 8,
  cgTagsTop: 38,
  cgTxtTop: 54,
  cgCloseL: 12,
  cgCloseT: 48,
  cgCloseSz: 34,
  cgBtnR: 14,
  cgBtnBottom: 118,
  cgBtnSafeExtra: 22,
  cgPadBot: 68,
  cgPadBotSafe: 12,
  cgBtnPx: 46,
  cgBtnPy: 14,
  cgBtnFs: 14,
  cgBtnMinW: 197,
  cgRwX: 12,
  cgRwY: 36,
  cgEssFsMin: 17,
  cgEssFsMax: 29,
  cgEssGap: 5,
  cgEssDx: 0,
  cgEssDy: 0,
  cgMcFsMin: 15,
  cgMcFsMax: 27,
  cgMcDx: 0,
  cgMcDy: 0,
  cgWowFsMin: 11,
  cgWowFsMax: 20,
  cgWowDx: 0,
  cgWowDy: 6,
};

let PT_M = { ...PT_M_DEFAULTS };

/** Rows: mVar is written on #congrats-overlay; __skip uses PT_M but applies elsewhere */
const PT_CG_MOBILE = [
  { col: 1, sec: 'Band', key: 'cgStripTop', label: 'Strip top', unit: '%', step: 1, min: 0, max: 90, mVar: '--cg-m-strip-top', cssSuffix: '%' },
  { col: 1, key: 'cgStripBot', label: 'Strip bot', unit: '%', step: 1, min: 0, max: 90, mVar: '--cg-m-strip-bot', cssSuffix: '%' },
  { col: 1, key: 'cgBandOp', label: 'Band α', unit: '%', step: 2, min: 5, max: 100, mVar: '__skip', cssSuffix: '%' },
  { col: 1, key: 'cgBandFadeS', label: 'Fade S', unit: '%', step: 2, min: 0, max: 100, mVar: '__skip', cssSuffix: '%' },
  { col: 1, key: 'cgBandFadeE', label: 'Fade E', unit: '%', step: 2, min: 0, max: 100, mVar: '__skip', cssSuffix: '%' },
  { col: 1, sec: 'Glow', key: 'cgGlowSz', label: 'Height', unit: 'px', step: 2, min: 4, max: 100, mVar: '--cg-m-glow-sz', cssSuffix: 'px' },
  { col: 1, key: 'cgGlowOp', label: 'Glow α', unit: '%', step: 2, min: 5, max: 100, mVar: '__skip', cssSuffix: '%' },
  { col: 1, key: 'cgGlowSolid', label: 'Solid', unit: '%', step: 2, min: 0, max: 80, mVar: '--cg-m-glow-solid', cssSuffix: '%' },
  { col: 1, key: 'cgGlowGone', label: 'Gone', unit: '%', step: 2, min: 20, max: 100, mVar: '--cg-m-glow-gone', cssSuffix: '%' },
  { col: 2, sec: 'Creature', key: 'cgCreatureTop', label: 'Y', unit: '%', step: 1, min: 0, max: 85, mVar: '--cg-m-creature-top', cssSuffix: '%' },
  { col: 2, key: 'cgCreatureSz', label: 'Size', unit: 'px', step: 4, min: 120, max: 480, mVar: '--cg-m-creature-sz', cssSuffix: 'px' },
  { col: 2, sec: 'WM', key: 'cgWmFsMin', label: 'FS min', unit: 'px', step: 2, min: 20, max: 200, mVar: '--cg-m-wm-fs-min', cssSuffix: 'px' },
  { col: 2, key: 'cgWmFsMax', label: 'FS max', unit: 'px', step: 2, min: 40, max: 280, mVar: '--cg-m-wm-fs-max', cssSuffix: 'px' },
  { col: 2, key: 'cgWmScale', label: 'Scale', unit: '%', step: 5, min: 40, max: 240, mVar: '__skip', cssSuffix: '%' },
  { col: 2, key: 'cgWmX', label: 'WM X', unit: 'px', step: 2, min: -400, max: 400, mVar: '--cg-m-wm-x', cssSuffix: 'px' },
  { col: 2, key: 'cgWmY', label: 'WM Y', unit: 'px', step: 2, min: -400, max: 400, mVar: '--cg-m-wm-y', cssSuffix: 'px' },
  { col: 2, key: 'cgWmOp', label: 'WM α', unit: '%', step: 1, min: 2, max: 45, mVar: '__skip', cssSuffix: '%' },
  { col: 3, sec: 'Tags & text', key: 'cgTagsTop', label: 'Tags Y', unit: '%', step: 1, min: 0, max: 90, mVar: '--cg-m-tags-top', cssSuffix: '%' },
  { col: 3, key: 'cgTxtTop', label: 'Text Y', unit: '%', step: 1, min: 0, max: 90, mVar: '--cg-m-txt-top', cssSuffix: '%' },
  { col: 3, sec: 'Close', key: 'cgCloseL', label: 'Left', unit: 'px', step: 2, min: 0, max: 160, mVar: '--cg-m-close-l', cssSuffix: 'px' },
  { col: 3, key: 'cgCloseT', label: 'Top', unit: 'px', step: 2, min: 0, max: 200, mVar: '--cg-m-close-t', cssSuffix: 'px' },
  { col: 3, key: 'cgCloseSz', label: 'Size', unit: 'px', step: 2, min: 28, max: 56, mVar: '--cg-m-close-sz', cssSuffix: 'px' },
  { col: 3, sec: 'CTA', key: 'cgBtnR', label: 'Btn right', unit: 'px', step: 2, min: 0, max: 120, mVar: '--cg-m-btn-r', cssSuffix: 'px' },
  { col: 3, key: 'cgBtnBottom', label: 'Btn bottom', unit: 'px', step: 4, min: 40, max: 280, mVar: '--cg-m-btn-bottom', cssSuffix: 'px' },
  { col: 3, key: 'cgBtnSafeExtra', label: 'Safe +', unit: 'px', step: 2, min: 0, max: 80, mVar: '--cg-m-btn-safe-extra', cssSuffix: 'px' },
  { col: 3, key: 'cgPadBot', label: 'Pad bot', unit: 'px', step: 4, min: 40, max: 160, mVar: '--cg-m-pad-bot', cssSuffix: 'px' },
  { col: 3, key: 'cgPadBotSafe', label: 'Pad safe', unit: 'px', step: 2, min: 0, max: 48, mVar: '--cg-m-pad-bot-safe', cssSuffix: 'px' },
  { col: 3, key: 'cgBtnPx', label: 'Btn pad X', unit: 'px', step: 2, min: 8, max: 80, mVar: '--cg-m-btn-px', cssSuffix: 'px' },
  { col: 3, key: 'cgBtnPy', label: 'Btn pad Y', unit: 'px', step: 2, min: 6, max: 48, mVar: '--cg-m-btn-py', cssSuffix: 'px' },
  { col: 3, key: 'cgBtnFs', label: 'Btn font', unit: 'px', step: 1, min: 10, max: 22, mVar: '--cg-m-btn-fs', cssSuffix: 'px' },
  { col: 3, key: 'cgBtnMinW', label: 'Btn minW', unit: 'px', step: 4, min: 80, max: 320, mVar: '--cg-m-btn-minw', cssSuffix: 'px' },
  { col: 4, sec: 'Reward', key: 'cgRwX', label: 'Right gap', unit: 'px', step: 2, min: 0, max: 120, mVar: '--cg-m-rw-x', cssSuffix: 'px' },
  { col: 4, key: 'cgRwY', label: 'Reward Y', unit: '%', step: 1, min: 0, max: 90, mVar: '--cg-m-rw-y', cssSuffix: '%' },
  { col: 4, sec: 'Essence', key: 'cgEssFsMin', label: 'Ess min', unit: 'px', step: 1, min: 8, max: 40, mVar: '--cg-m-ess-fs-min', cssSuffix: 'px' },
  { col: 4, key: 'cgEssFsMax', label: 'Ess max', unit: 'px', step: 1, min: 12, max: 60, mVar: '--cg-m-ess-fs-max', cssSuffix: 'px' },
  { col: 4, key: 'cgEssGap', label: 'Gap', unit: 'px', step: 1, min: 0, max: 30, mVar: '--cg-m-ess-gap', cssSuffix: 'px' },
  { col: 4, key: 'cgEssDx', label: 'Ess X', unit: 'px', step: 2, min: -200, max: 200, mVar: '--cg-m-ess-dx', cssSuffix: 'px' },
  { col: 4, key: 'cgEssDy', label: 'Ess Y', unit: 'px', step: 2, min: -200, max: 200, mVar: '--cg-m-ess-dy', cssSuffix: 'px' },
  { col: 4, sec: 'Memcore', key: 'cgMcFsMin', label: 'MC min', unit: 'px', step: 1, min: 8, max: 36, mVar: '--cg-m-mc-fs-min', cssSuffix: 'px' },
  { col: 4, key: 'cgMcFsMax', label: 'MC max', unit: 'px', step: 1, min: 10, max: 44, mVar: '--cg-m-mc-fs-max', cssSuffix: 'px' },
  { col: 4, key: 'cgMcDx', label: 'MC X', unit: 'px', step: 2, min: -200, max: 200, mVar: '--cg-m-mc-dx', cssSuffix: 'px' },
  { col: 4, key: 'cgMcDy', label: 'MC Y', unit: 'px', step: 2, min: -200, max: 200, mVar: '--cg-m-mc-dy', cssSuffix: 'px' },
  { col: 4, sec: 'Wow', key: 'cgWowFsMin', label: 'Wow min', unit: 'px', step: 1, min: 8, max: 28, mVar: '--cg-m-wow-fs-min', cssSuffix: 'px' },
  { col: 4, key: 'cgWowFsMax', label: 'Wow max', unit: 'px', step: 1, min: 10, max: 36, mVar: '--cg-m-wow-fs-max', cssSuffix: 'px' },
  { col: 4, key: 'cgWowDx', label: 'Wow X', unit: 'px', step: 2, min: -200, max: 200, mVar: '--cg-m-wow-dx', cssSuffix: 'px' },
  { col: 4, key: 'cgWowDy', label: 'Wow Y', unit: 'px', step: 2, min: -200, max: 200, mVar: '--cg-m-wow-dy', cssSuffix: 'px' },
];

function _loadPTMobileFromLs() {
  try {
    const raw = localStorage.getItem(_DEV_CG_MOBILE_LS);
    if (!raw) return;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return;
    for (const k of Object.keys(PT_M_DEFAULTS)) {
      if (typeof o[k] === 'number' && !isNaN(o[k])) PT_M[k] = o[k];
    }
  } catch (_) {}
}

function _savePTMobileToLs() {
  try {
    localStorage.setItem(_DEV_CG_MOBILE_LS, JSON.stringify(PT_M));
  } catch (_) {}
}

function _applyPTMobileBannerMaskAndGlow(overlay) {
  const bOp = PT_M.cgBandOp / 100;
  const bS = PT_M.cgBandFadeS;
  const bE = PT_M.cgBandFadeE;
  const maskVal = `linear-gradient(to right, rgba(0,0,0,${bOp}) 0%, rgba(0,0,0,${bOp}) ${bS}%, transparent ${bE}%)`;
  const bannerMain = overlay.querySelector('.cg-banner-main');
  if (bannerMain) {
    bannerMain.style.maskImage = maskVal;
    bannerMain.style.webkitMaskImage = maskVal;
  }
  const gOp = PT_M.cgGlowOp / 100;
  overlay.querySelectorAll('.cg-banner-top-glow, .cg-banner-bot-glow').forEach(el => {
    el.style.opacity = String(gOp);
  });
}

function _applyPTMobile() {
  const overlay = document.getElementById('congrats-overlay');
  if (!overlay) return;

  const mq =
    typeof window.matchMedia === 'function' ? window.matchMedia('(max-width: 720px)') : null;
  const mobile = mq ? mq.matches : window.innerWidth <= 720;

  PT_CG_MOBILE.forEach(r => {
    const elIn = document.getElementById('pt-cgm-' + r.key);
    if (elIn) elIn.value = PT_M[r.key];
    if (r.mVar === '__skip') return;
    const suf = r.cssSuffix ?? '';
    overlay.style.setProperty(r.mVar, String(PT_M[r.key]) + suf);
  });

  overlay.style.setProperty('--cg-m-wm-sc', String(PT_M.cgWmScale / 100));
  overlay.style.setProperty('--cg-m-wm-op', String(PT_M.cgWmOp / 100));

  if (overlay.classList.contains('show')) {
    if (mobile) _applyPTMobileBannerMaskAndGlow(overlay);
    else if (typeof _applyPT === 'function') _applyPT();
  }

  const ro = document.getElementById('cg-m-tuner-readout');
  if (ro) {
    ro.textContent = [
      `band ${PT_M.cgStripTop}-${PT_M.cgStripBot}% α${PT_M.cgBandOp}% ${PT_M.cgBandFadeS}-${PT_M.cgBandFadeE}%`,
      `glow ${PT_M.cgGlowSz}px α${PT_M.cgGlowOp}%`,
      `sprite ${PT_M.cgCreatureTop}% ${PT_M.cgCreatureSz}px`,
      `wm clamp ${PT_M.cgWmFsMin}-${PT_M.cgWmFsMax}px ×${PT_M.cgWmScale}% xy${PT_M.cgWmX},${PT_M.cgWmY} α${PT_M.cgWmOp}%`,
      `tags ${PT_M.cgTagsTop}% text ${PT_M.cgTxtTop}%`,
      `× ${PT_M.cgCloseL},${PT_M.cgCloseT} (${PT_M.cgCloseSz}px)`,
      `btn R${PT_M.cgBtnR} bot${PT_M.cgBtnBottom} safe+${PT_M.cgBtnSafeExtra} padB${PT_M.cgPadBot}`,
      `rw ${PT_M.cgRwX}px Y${PT_M.cgRwY}%`,
      `ess ${PT_M.cgEssFsMin}-${PT_M.cgEssFsMax}px gap${PT_M.cgEssGap}`,
      `mc ${PT_M.cgMcFsMin}-${PT_M.cgMcFsMax}px wow ${PT_M.cgWowFsMin}-${PT_M.cgWowFsMax}px`,
    ].join(' · ');
  }
}

function _ptMAdj(key, delta) {
  const r = PT_CG_MOBILE.find(x => x.key === key);
  if (!r) return;
  let v = PT_M[key] + delta;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  PT_M[key] = v;
  _savePTMobileToLs();
  _applyPTMobile();
}

function _ptMSet(key, val) {
  const r = PT_CG_MOBILE.find(x => x.key === key);
  if (!r) return;
  let v = parseFloat(val);
  if (isNaN(v)) return;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  PT_M[key] = v;
  _savePTMobileToLs();
  _applyPTMobile();
}

function _makeTunerRowMobile(r) {
  const d = document.createElement('div');
  d.className = 'cgt-row';
  d.innerHTML =
    `<span class="cgt-label">${r.label}</span>` +
    `<button type="button" class="cgt-btn" onclick="_ptMAdj('${r.key}',-${r.step})">↑</button>` +
    `<input id="pt-cgm-${r.key}" class="cgt-input" type="number" value="${PT_M[r.key]}" onchange="_ptMSet('${r.key}',this.value)">` +
    `<button type="button" class="cgt-btn" onclick="_ptMAdj('${r.key}',${r.step})">↓</button>` +
    `<span class="cgt-unit">${r.unit}</span>`;
  return d;
}

let _cgMobileResizeHooked = false;
function _ensureCgMobileResizeHook() {
  if (_cgMobileResizeHooked) return;
  _cgMobileResizeHooked = true;
  window.addEventListener(
    'resize',
    () => {
      const o = document.getElementById('congrats-overlay');
      if (!o || !o.classList.contains('show')) return;
      if (typeof _applyPTMobile === 'function') _applyPTMobile();
    },
    { passive: true }
  );
}

function _initTunerMobile() {
  _ensureCgMobileResizeHook();
  _loadPTMobileFromLs();
  const wrap = document.getElementById('cg-m-tuner-rows');
  if (wrap) {
    wrap.innerHTML = '';
    const maxCol = PT_CG_MOBILE.reduce((m, r) => Math.max(m, r.col || 1), 1);
    const cols = [];
    const lastSec = {};
    for (let i = 1; i <= maxCol; i++) {
      const c = document.createElement('div');
      c.className = 'cg-tuner-col';
      c.dataset.col = String(i);
      wrap.appendChild(c);
      cols.push(c);
      lastSec[i] = null;
    }
    PT_CG_MOBILE.forEach(r => {
      const ci = r.col || 1;
      const colEl = cols[ci - 1];
      if (!colEl) return;
      if (r.sec && r.sec !== lastSec[ci]) {
        lastSec[ci] = r.sec;
        const h = document.createElement('div');
        h.className = 'cgt-sec';
        h.textContent = r.sec;
        colEl.appendChild(h);
      }
      colEl.appendChild(_makeTunerRowMobile(r));
    });
  }
  _applyPTMobile();
}

function _resetPTMobile() {
  PT_M = { ...PT_M_DEFAULTS };
  try {
    localStorage.removeItem(_DEV_CG_MOBILE_LS);
  } catch (_) {}
  _initTunerMobile();
}

function _applyPT() {
  const root = document.documentElement;
  PT_CG.forEach(r => {
    if (r.cssVar === '__skip') {
      const elSkip = document.getElementById('pt-cg-' + r.key);
      if (elSkip) elSkip.value = PT[r.key];
      return;
    }
    const suf = r.cssSuffix ?? '%';
    root.style.setProperty(r.cssVar, String(PT[r.key]) + suf);
    const el = document.getElementById('pt-cg-' + r.key);
    if (el) el.value = PT[r.key];
  });
  if (PT.cgBtnW > 0) root.style.setProperty('--cg-btn-w', PT.cgBtnW + 'px');
  else root.style.removeProperty('--cg-btn-w');
  if (PT.cgBtnH > 0) root.style.setProperty('--cg-btn-h', PT.cgBtnH + 'px');
  else root.style.removeProperty('--cg-btn-h');

  root.style.setProperty('--cg-wm-sc', String(PT.cgWmScale / 100));
  root.style.setProperty('--cg-wm-op', String(PT.cgWmOp / 100));

  // Banner mask from tuner knobs
  const bOp = PT.cgBandOp / 100;
  const bS  = PT.cgBandFadeS;
  const bE  = PT.cgBandFadeE;
  const maskVal = `linear-gradient(to right, rgba(0,0,0,${bOp}) 0%, rgba(0,0,0,${bOp}) ${bS}%, transparent ${bE}%)`;
  const bannerMain = document.querySelector('.cg-banner-main');
  if (bannerMain) {
    bannerMain.style.maskImage = maskVal;
    bannerMain.style.webkitMaskImage = maskVal;
  }

  // Edge glow tuner
  const gOp = PT.cgGlowOp / 100;
  document.querySelectorAll('.cg-banner-top-glow, .cg-banner-bot-glow').forEach(el => {
    el.style.opacity = gOp;
  });

  const ro = document.getElementById('cg-tuner-readout');
  if (ro) {
    ro.textContent = [
      `band ${PT.cgStripTop}-${PT.cgStripBot}% α${PT.cgBandOp}% fade${PT.cgBandFadeS}-${PT.cgBandFadeE}%`,
      `glow h${PT.cgGlowSz} α${PT.cgGlowOp}% solid${PT.cgGlowSolid}% gone${PT.cgGlowGone}%`,
      `sprite ${PT.cgCreatureTop}% ${PT.cgCreatureSz}px`,
      `wm ${PT.cgWmFs}px ×${PT.cgWmScale}% xy${PT.cgWmX},${PT.cgWmY} α${PT.cgWmOp}%`,
      `tags ${PT.cgTagsTop}% · text ${PT.cgTxtTop}%`,
      `× ${PT.cgCloseL},${PT.cgCloseT} (${PT.cgCloseSz}px)`,
      `btn R${PT.cgBtnR} T${PT.cgBtnT} pad${PT.cgBtnPx}×${PT.cgBtnPy} ${PT.cgBtnFs}px minW${PT.cgBtnMinW}${PT.cgBtnW?` w${PT.cgBtnW}`:''}${PT.cgBtnH?` h${PT.cgBtnH}`:''}`,
      `rw R${PT.cgRwX} Y${PT.cgRwY}%`,
      `ess ws${PT.cgEssFs} ns${PT.cgEssNumFs} gap${PT.cgEssGap} xy${PT.cgEssDx},${PT.cgEssDy}`,
      `mc ${PT.cgMcFs}px xy${PT.cgMcDx},${PT.cgMcDy}`,
      `wow ${PT.cgWowFs}px xy${PT.cgWowDx},${PT.cgWowDy}`,
    ].join('  ·  ');
  }
}

function copyTunerReadout(feedbackBtn) {
  copyReadout('cg-tuner-readout', feedbackBtn);
}
/** Uses Clipboard API when available; textarea fallback helps mobile / insecure origins. */
function copyReadout(id, feedbackBtn) {
  const ro = document.getElementById(id);
  if (!ro) return;
  const text = ro.textContent;
  const markDone = () => {
    const btn = feedbackBtn && feedbackBtn.nodeType === 1 ? feedbackBtn : null;
    if (!btn) return;
    const prev = btn.textContent;
    btn.textContent = '✓';
    setTimeout(() => {
      btn.textContent = prev;
    }, 1200);
  };
  const fallbackCopy = () => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) markDone();
    } catch (_) {}
  };
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(text).then(markDone).catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
}

// ── TUNER COLLAPSE ──
function toggleTunerBody(panelId, bodyId) {
  const body = document.getElementById(bodyId);
  if (!body) return;
  const panel = document.getElementById(panelId);
  const btn = panel?.querySelector('.tuner-collapse-btn');
  body.classList.toggle('tuner-body-hidden');
  const collapsed = body.classList.contains('tuner-body-hidden');
  if (btn) {
    btn.textContent = collapsed ? '▶' : '▼';
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }
}

function _ptAdj(key, delta) {
  const r = PT_CG.find(x => x.key === key);
  if (!r) return;
  let v = PT[key] + delta;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  PT[key] = v; _applyPT();
}
function _ptSet(key, val) {
  const r = PT_CG.find(x => x.key === key);
  if (!r) return;
  let v = parseFloat(val); if (isNaN(v)) return;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  PT[key] = v; _applyPT();
}

function _makeTunerRow(r) {
  const d = document.createElement('div');
  d.className = 'cgt-row';
  d.innerHTML =
    `<span class="cgt-label">${r.label}</span>` +
    `<button class="cgt-btn" onclick="_ptAdj('${r.key}',-${r.step})">↑</button>` +
    `<input id="pt-cg-${r.key}" class="cgt-input" type="number" value="${PT[r.key]}" onchange="_ptSet('${r.key}',this.value)">` +
    `<button class="cgt-btn" onclick="_ptAdj('${r.key}',${r.step})">↓</button>` +
    `<span class="cgt-unit">${r.unit}</span>`;
  return d;
}

function _initTuner() {
  const wrap = document.getElementById('cg-tuner-rows');
  if (wrap) {
    wrap.innerHTML = '';
    const maxCol = PT_CG.reduce((m, r) => Math.max(m, r.col || 1), 1);
    const cols = [];
    const lastSec = {};
    for (let i = 1; i <= maxCol; i++) {
      const c = document.createElement('div');
      c.className = 'cg-tuner-col';
      c.dataset.col = String(i);
      wrap.appendChild(c);
      cols.push(c);
      lastSec[i] = null;
    }
    PT_CG.forEach(r => {
      const ci = r.col || 1;
      const colEl = cols[ci - 1];
      if (!colEl) return;
      if (r.sec && r.sec !== lastSec[ci]) {
        lastSec[ci] = r.sec;
        const h = document.createElement('div');
        h.className = 'cgt-sec';
        h.textContent = r.sec;
        colEl.appendChild(h);
      }
      colEl.appendChild(_makeTunerRow(r));
    });
  }
  _applyPT();
}
