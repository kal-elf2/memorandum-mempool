// SCROLL — grid expand/collapse, scroll detection, back-to-top, scroll thumb

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════
const _DEV_MODE = location.search.includes('dev');
if (_DEV_MODE) {
  _initTuner();
  _initGridTuner();
  _initCardTuner();
  _initDetailTuner();
  _initInstanceCardTuner();
  _initGrid3dTuner();
  _initTovTuner();
  document.querySelectorAll('.dev-only').forEach(el => el.style.display = '');
} else {
  document.querySelectorAll('[id$="-tuner"], #dev-memcore-bar').forEach(el => el.style.display = 'none');
}
buildTypeIconRow();
// ══════════════════════════════════════════════════════════════
//  GRID EXPAND / COLLAPSE  (scroll-to-collapse or toggle button)
// ══════════════════════════════════════════════════════════════
function toggleGridExpand(headerCollapsed) {
  const sg = document.getElementById('screen-grid');
  if (!sg) return;
  const willCollapse = !!headerCollapsed;
  const isCollapsed = sg.classList.contains('grid-expanded');
  if (willCollapse === isCollapsed) return;

  clearTimeout(sg._hdrCollapseT);

  if (willCollapse) {
    sg.classList.add('grid-header-hiding');
    sg._hdrCollapseT = setTimeout(() => {
      sg.classList.add('grid-expanded');
      sg.classList.remove('grid-header-hiding');
      syncCardRows();
      clearTimeout(sg._hdrSyncT);
      sg._hdrSyncT = setTimeout(syncCardRows, 480);
    }, 125);
  } else {
    sg.classList.remove('grid-header-hiding');
    sg.classList.remove('grid-expanded');
    syncCardRows();
    clearTimeout(sg._hdrSyncT);
    sg._hdrSyncT = setTimeout(syncCardRows, 480);
  }
}

// Collapse welcome when user scrolls the dex; restore welcome only by wheel-up / pull-down at top (not auto on scrollTop).
(function() {
  const cells = document.getElementById('grid-cells');
  const sg = document.getElementById('screen-grid');
  if (!cells || !sg) return;
  const COLLAPSE_BELOW = 36;

  function suppressActive() {
    return typeof window._gridTypeScrollSuppressUntil === 'number' &&
      Date.now() < window._gridTypeScrollSuppressUntil;
  }

  cells.addEventListener('scroll', function() {
    if (suppressActive()) return;
    if (this.scrollTop > COLLAPSE_BELOW && !sg.classList.contains('grid-expanded'))
      toggleGridExpand(true);
  }, { passive: true });

  /* Desktop / trackpad: at top of grid, scroll "up" once more → show welcome */
  cells.addEventListener('wheel', function(e) {
    if (suppressActive()) return;
    if (!sg.classList.contains('grid-expanded')) return;
    if (cells.scrollTop > 1) return;
    if (e.deltaY >= -1) return;
    toggleGridExpand(false);
    e.preventDefault();
  }, { passive: false });

  /* Touch: pull down while at top → show welcome */
  let touchY0 = null;
  cells.addEventListener('touchstart', function(e) {
    touchY0 = e.touches.length ? e.touches[0].clientY : null;
  }, { passive: true });
  cells.addEventListener('touchmove', function(e) {
    if (touchY0 == null || !e.touches.length) return;
    if (suppressActive()) return;
    if (!sg.classList.contains('grid-expanded')) return;
    if (cells.scrollTop > 1) return;
    const dy = e.touches[0].clientY - touchY0;
    if (dy > 52) {
      toggleGridExpand(false);
      touchY0 = e.touches[0].clientY;
    }
  }, { passive: true });
  cells.addEventListener('touchend', function() { touchY0 = null; }, { passive: true });

  // Scroll position indicator
  const track = document.getElementById('grid-scroll-track');
  const thumb = document.getElementById('grid-scroll-thumb');
  function updateScrollThumb() {
    if (!track || !thumb) return;
    const sh = cells.scrollHeight;
    const ch = cells.clientHeight;
    if (sh <= ch) { track.style.visibility = 'hidden'; return; }
    track.style.visibility = '';
    const trackH = track.clientHeight;
    const ratio = ch / sh;
    const thumbH = Math.max(24, Math.round(trackH * ratio));
    const scrollPct = cells.scrollTop / (sh - ch);
    const maxTop = trackH - thumbH;
    thumb.style.height = thumbH + 'px';
    thumb.style.top = Math.round(scrollPct * maxTop) + 'px';
  }
  cells.addEventListener('scroll', updateScrollThumb, { passive: true });
  // Also update on grid render
  const origRenderGrid = window.renderGrid;
  if (origRenderGrid) {
    window._updateScrollThumb = updateScrollThumb;
  }
  setTimeout(updateScrollThumb, 300);
})();

function scrollGridToTop() {
  const cells = document.getElementById('grid-cells');
  if (!cells) return;
  window._gridTypeScrollSuppressUntil = Date.now() + 1500;
  cells.scrollTo({ top: 0, behavior: 'smooth' });
  let frames = 0;
  function check() {
    frames++;
    if (cells.scrollTop <= 2 || frames > 60) {
      toggleGridExpand(false);
      return;
    }
    requestAnimationFrame(check);
  }
  requestAnimationFrame(check);
}

loadData();
