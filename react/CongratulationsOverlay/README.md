# CongratulationsOverlay (React / Next.js)

A generic, reusable React port of the Memorandum Mempool **"Congratulations"**
capture banner. It is the same overlay the prototype renders in `index.html` +
`js/encounter.js` + `css/styles.css`, refactored so it carries **no game state,
no DOM lookups, and no baked-in asset maps**. The host app passes the values
(memory type, essence, image URL, badges, …) as props.

## Files

| File | Purpose |
| --- | --- |
| `CongratulationsOverlay.tsx` | The component. A Client Component (`'use client'`). |
| `CongratulationsOverlay.module.css` | Scoped styles, ported 1:1 from the prototype (dev tuner removed). |

Drop the folder anywhere under your Next.js app, e.g. `components/CongratulationsOverlay/`.
Works with the App Router and the Pages Router. No extra dependencies.

> Prefer JavaScript? Rename to `.jsx` and delete the type annotations — the logic
> is unchanged.

## Usage

```tsx
'use client';
import { useState } from 'react';
import CongratulationsOverlay from '@/components/CongratulationsOverlay/CongratulationsOverlay';

export function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Simulate capture</button>

      <CongratulationsOverlay
        open={open}
        memoryType="BRAVE_TYPE_HERE_OR_ELEMENTAL" // e.g. "WATER", "FIRE", "VOID"
        name="Kitlem"
        imageSrc="/sprites/kitlem.png"
        rarity="common"
        personality="brave"
        essence={7}
        memcoreGain={4}
        primaryLabel="View in Mempool"
        onPrimary={() => {
          setOpen(false);
          // route to the mempool / dex view
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Mounts/unmounts the overlay. |
| `memoryType` | `MemoryType \| string` | `WATER` fallback | Drives the banner gradient via the bundled type→gradient map. |
| `bannerColors` | `[string, string]` | — | Explicit `[c1, c2]` gradient override. Wins over `memoryType`. |
| `imageSrc` | `string` | — | **Resolved** sprite URL (you map dex id → URL on your side). |
| `imageAlt` | `string` | `name` | Alt text for the sprite. |
| `name` | `string` | `''` | Memory name. Also drawn as the faint watermark behind the sprite. |
| `isShiny` | `boolean` | `false` | Adds a `★` to the name and an "★ Akronite" badge. |
| `rarity` | `string` | — | e.g. `"common"` → a tinted `COMMON` badge. |
| `personality` | `string` | — | e.g. `"brave"` → a tinted `BRAVE` badge. |
| `badges` | `CongratsBadge[]` | — | Full override of the badge row (skips the auto badges above). |
| `essence` | `number` | — | The big `N Essence` line. Omit to hide. |
| `memcoreGain` | `number` | — | The `+N ◆` line. Omit to hide. |
| `wowLabel` | `string` | — | e.g. `"NICE"`, `"BIG WOW"`, `"HUGE WOW"` — color inferred from the text. |
| `title` | `string` | `"Congratulations"` | |
| `subtitle` | `string` | `"A new memory has been etched into your collection"` | |
| `primaryLabel` | `string` | `"View in Mempool"` | CTA text. |
| `onPrimary` | `() => void` | — | CTA click handler. |
| `onClose` | `() => void` | — | Fired by ×, Escape, or backdrop click. |
| `moteCount` | `number` | `20` | Ambient banner motes. `0` disables. |
| `closeIconSrc` | `string` | built-in SVG | Custom close-button icon. |
| `closeOnBackdrop` | `boolean` | `true` | Click the dark backdrop to close. |
| `className` / `style` | — | — | Escape hatches on the root element. |

The gradient, rarity, and personality color maps are bundled inside the
component (ported from `helpers.js` / `data.js`). Override per-render with
`bannerColors` / `badges` when your app owns its own palette.

## Parity notes vs. the prototype

- **Visual layout is preserved exactly.** The CSS keeps the original
  `var(--cg-*, <default>)` variables, so the shipped desktop composition and all
  three mobile breakpoints render identically out of the box, and remain
  tweakable from a parent via CSS variables.
- **Dropped:** the dev-only position tuner panel (`#cg-tuner-panel`, `js/detail-tuner.js`
  wiring). That was an authoring tool, not part of the shipped overlay.
- **Motes** are generated on the client after mount (so there is no SSR
  hydration mismatch) and respect `prefers-reduced-motion`.
- Accessibility: `role="dialog"`, `aria-modal`, Escape-to-close, and focus moves
  to the close button on open.

## Recommended: how to wire this into Godot + Next.js (instead of an iframe)

The previous dev embedded the overlay in an `<iframe>`. For a Godot (HTML5/WebGL
export) game hosted inside a Next.js app, an iframe is the most brittle option:
it duplicates the bundle, can't read your app's theme/router/auth, and the
Godot↔overlay handoff has to cross an origin boundary by string message-passing.

A cleaner architecture:

1. **Render the Godot canvas and the overlay as siblings in the same React tree.**
   The overlay is `position: fixed; inset: 0` and already z-indexed above
   everything, so it naturally floats over the `<canvas>`. No iframe.

2. **Let Godot emit events; let React own the UI.** Godot's HTML5 export can call
   into JS. Expose a small bridge and have your page subscribe:

   ```ts
   // In the page that hosts the canvas:
   useEffect(() => {
     function onCapture(e: CustomEvent) {
       setCapture(e.detail); // { memoryType, name, imageSrc, essence, ... }
       setOpen(true);
     }
     window.addEventListener('mempool:capture', onCapture as EventListener);
     return () => window.removeEventListener('mempool:capture', onCapture as EventListener);
   }, []);
   ```

   ```gdscript
   # In Godot (GDScript), on a successful capture:
   var payload := JSON.stringify({
       "memoryType": mem.type, "name": mem.name, "imageSrc": sprite_url,
       "rarity": mem.rarity, "personality": mem.personality,
       "essence": revealed_essence, "memcoreGain": mem.yield, "wowLabel": wow_label,
   })
   JavaScriptBridge.eval(
       "window.dispatchEvent(new CustomEvent('mempool:capture', { detail: " + payload + " }))"
   )
   ```

3. **Send the user back into the game from `onPrimary` / `onClose`.** Instead of
   the prototype's `closeCongrats('detail')` screen navigation, call back into
   Godot (e.g. `JavaScriptBridge.eval("window.godot.viewInMempool()")`) or route
   with the Next.js router — whichever owns that destination.

4. **Keep image resolution on the app side.** The prototype mapped `dex_id` →
   sprite via `IMAGE_MAP` / `SHINY_MAP`. Pass the already-resolved `imageSrc`
   (a `/public` path or CDN URL) so the component stays asset-agnostic and you
   can use `next/image` upstream if you want.

This keeps one bundle, one theme, one router, and one source of truth for game
events — the overlay is just a presentational React component that any part of
the app (or Godot) can trigger.
