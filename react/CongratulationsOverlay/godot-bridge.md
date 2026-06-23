# Godot 4 ↔ Next.js bridge — CongratulationsOverlay

How to drive the React `CongratulationsOverlay` from a Godot 4 (HTML5/WebGL)
game running inside a Next.js app, **without an iframe**.

## The idea

- The Godot game runs in a `<canvas>`.
- The overlay is a React component rendered as a **sibling** over that canvas
  (it's `position: fixed; inset: 0` and already z-indexed above everything).
- On a capture, **Godot emits a browser event**; **React listens** and opens the
  overlay. React owns all the UI; Godot owns the game.

One bundle, one theme, one router, one source of truth for game events.

```
 Godot capture ──JavaScriptBridge.eval──▶ window 'mempool:capture' event
                                                   │
                                          React listener (useEffect)
                                                   │
                                          <CongratulationsOverlay open .../>
                                                   │
                          onPrimary / onClose ─────┘──▶ back into Godot or Next router
```

## 1. Godot side (GDScript, Godot 4)

`JavaScriptBridge` is the Godot **4.x** singleton (it was `JavaScript` in 3.x).
It only exists in web exports, so guard with `OS.has_feature("web")`.

```gdscript
# Call on a successful capture.
func show_congrats(mem, revealed_essence: int, wow_label: String, sprite_url: String) -> void:
    if not OS.has_feature("web"):
        return  # no-op in the editor / native builds

    var payload := JSON.stringify({
        "memoryType":  mem.type,          # "WATER", "FIRE", "VOID", ...
        "name":        mem.name,
        "imageSrc":    sprite_url,         # resolved /public or CDN URL
        "rarity":      mem.rarity,         # "common", "rare", ...
        "personality": mem.personality,    # "brave", "bubbly", ...
        "essence":     revealed_essence,
        "memcoreGain": mem.yield,          # the "+N ◆" line
        "wowLabel":    wow_label,          # "NICE" / "BIG WOW" / "HUGE WOW" (optional)
    })

    JavaScriptBridge.eval(
        "window.dispatchEvent(new CustomEvent('mempool:capture', { detail: " + payload + " }))"
    )
```

### Receiving the "View in Mempool" / close actions back from React

Expose a tiny JS API that React can call, then react to it in Godot. The robust
way in Godot 4 is a `JavaScriptObject` callback so JS can call back into GDScript:

```gdscript
var _view_cb: JavaScriptObject

func _ready() -> void:
    if OS.has_feature("web"):
        # Keep a reference so the callback isn't garbage-collected.
        _view_cb = JavaScriptBridge.create_callback(_on_view_in_mempool)
        var window := JavaScriptBridge.get_interface("window")
        window.godotViewInMempool = _view_cb

func _on_view_in_mempool(_args) -> void:
    # e.g. close the capture flow and focus the dex/mempool entry in-game
    pass
```

(If you'd rather keep navigation on the web side, skip the callback and just have
`onPrimary` use the Next.js router — see below.)

## 2. Next.js side (React)

```tsx
'use client';
import { useEffect, useState } from 'react';
import CongratulationsOverlay, {
  type CongratulationsOverlayProps,
} from '@/components/CongratulationsOverlay/CongratulationsOverlay';

// The event payload mirrors the component's props 1:1.
type CapturePayload = Partial<CongratulationsOverlayProps>;

export function GameShell() {
  const [open, setOpen] = useState(false);
  const [capture, setCapture] = useState<CapturePayload>({});

  useEffect(() => {
    function onCapture(e: Event) {
      setCapture((e as CustomEvent<CapturePayload>).detail);
      setOpen(true);
    }
    window.addEventListener('mempool:capture', onCapture as EventListener);
    return () => window.removeEventListener('mempool:capture', onCapture as EventListener);
  }, []);

  function viewInMempool() {
    setOpen(false);
    // Option A — hand back to Godot:
    (window as any).godotViewInMempool?.();
    // Option B — route on the web side instead:
    // router.push('/mempool');
  }

  return (
    <>
      {/* <canvas id="godot-canvas" /> lives here, rendered by your Godot loader */}
      <CongratulationsOverlay
        open={open}
        {...capture}
        onPrimary={viewInMempool}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
```

## Contract: event `detail` keys == component props

The keys Godot puts in `detail` are spread straight into the component
(`{...capture}`), so they must match the prop names. No remapping needed.

| `detail` key | Prop | Required | Notes |
| --- | --- | --- | --- |
| `memoryType` | `memoryType` | recommended | Drives banner gradient. Falls back to `WATER`. |
| `name` | `name` | recommended | Also the watermark behind the sprite. |
| `imageSrc` | `imageSrc` | recommended | **Resolved** URL (Godot/host maps dex id → URL). |
| `rarity` | `rarity` | optional | e.g. `"common"` → tinted badge. |
| `personality` | `personality` | optional | e.g. `"brave"` → tinted badge. |
| `essence` | `essence` | optional | Big `N Essence` line. Omit to hide. |
| `memcoreGain` | `memcoreGain` | optional | `+N ◆` line. Omit to hide. |
| `wowLabel` | `wowLabel` | optional | Color inferred from text. |
| `isShiny` | `isShiny` | optional | Adds `★` + "Akronite" badge. |

See `README.md` for the full prop list (title/subtitle/primaryLabel/badges/etc.).

## Checklist

- [ ] Render the Godot `<canvas>` and `<CongratulationsOverlay>` in the same React tree.
- [ ] Add `show_congrats(...)` (above) and call it on capture.
- [ ] Add the `mempool:capture` listener in the shell component.
- [ ] Decide who owns "View in Mempool": Godot callback (Option A) or Next router (Option B).
- [ ] Map dex id → sprite URL on your side before sending `imageSrc`.
- [ ] Typecheck in the real Next app (the prototype repo is plain JS, so I couldn't run `tsc` here).
