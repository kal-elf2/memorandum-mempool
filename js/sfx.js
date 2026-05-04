// SFX — menu click sound on interactive element taps
const _clickSfx = new Audio('assets/sfx/menu_click.wav');
_clickSfx.volume = 0.6;
function playClick() { _clickSfx.currentTime = 0; _clickSfx.play().catch(()=>{}); }
document.addEventListener('click', e => {
  const t = e.target.closest('button, .mode-tab, .ftab, .detail-tab, .gc-card, .tov-row, .bg-swatch, .congrats-btn-primary, .imx-nav-btn, [onclick]');
  if (t && t.closest('#screen-area')) playClick();
});
