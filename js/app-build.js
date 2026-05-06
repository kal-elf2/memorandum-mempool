/* Embed vs dev — loaded first from index.html <head>.
 *
 * Branch convention:
 *   main / master → MEMPOOL_PRODUCTION_BUILTIN = false → full dev (biomes, tuners, Vercel previews).
 *   production      → MEMPOOL_PRODUCTION_BUILTIN = true  → device-only embed (updated by GitHub Actions).
 *
 * Actions: on push to main/master, workflow resets `production` to the same tree + flips this flag only.
 * Local escape hatch: npm run build:production / npm run build:dev
 * Query overrides: ?prod=1 embed chrome; ?dev=1 dev chrome.
 */
(function () {
  var MEMPOOL_PRODUCTION_BUILTIN = true;

  window.__MEMPOOL_PRODUCTION__ = MEMPOOL_PRODUCTION_BUILTIN;
  try {
    var q = new URLSearchParams(window.location.search || '');
    if (q.get('prod') === '1') window.__MEMPOOL_PRODUCTION__ = true;
    if (q.get('dev') === '1') window.__MEMPOOL_PRODUCTION__ = false;
  } catch (e) {}

  if (window.__MEMPOOL_PRODUCTION__) {
    document.documentElement.classList.add('mempool-production');
  }
})();
