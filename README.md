# Memorandum — Mempool

## Overview

A web-based creature collection game prototype. Players discover, save, level, evolve, and optionally mint (bond) Memory creatures. Built as a static single-page app with no backend dependencies — all state is ephemeral (session only, no persistence layer yet).

## Live Demo

Deployed on Vercel. Link will be added after deployment.

## Quick Start

```bash
# Clone the repo
git clone <repo-url>
cd mempool

# Serve locally (any static file server works)
npx serve . -l 3000
# or
python -m http.server 3000
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
mempool/
├── index.html                  Main HTML shell linking all CSS and JS
├── mempool.json                All 144 creature definitions (required)
├── memory_spawn_ranges.json    Biome encounter tables (required)
├── vercel.json                 Vercel deployment config
├── package.json                Project metadata
│
├── css/
│   └── styles.css              All visual styles (design tokens, components, screens)
│
├── js/
│   ├── sfx.js                  Sound effects
│   ├── tuners.js               Congrats layout tuner system
│   ├── animation.js            Logo idle animation
│   ├── type-overview.js        Type collection progress screen
│   ├── data.js                 Image maps, constants, game config
│   ├── state.js                Player state object
│   ├── data-loader.js          Fetches and parses game data JSON
│   ├── navigation.js           Screen/tab/filter switching
│   ├── helpers.js              Design constants (colors, gradients), HTML utilities
│   ├── instance-card.js        Instance modal, mint status, evolution chains
│   ├── encounter.js            RNG encounter engine, congrats screen
│   ├── render.js               Grid rendering, card generation
│   ├── detail.js               Detail screen, collection tab
│   ├── game-actions.js         Level up, evolve, mint, debug, reset
│   ├── grid-tuner.js           Grid page layout tuner
│   ├── detail-tuner.js         Detail page layout tuner
│   ├── instance-tuner.js       Instance card + 3D grid tuner
│   └── scroll.js               Scroll behavior, expand/collapse, bootstrap
│
└── assets/
    ├── icons/                  Type icons, UI icons (back-square, search, blueprint, etc.)
    ├── logo/                   MiniMetamon logos (color, white)
    ├── memories/               Creature sprites (###.png normal, ###s.png Akronite/shiny)
    ├── concept/                Concept art (###_concept.png)
    ├── spirits/                Evolution spirit icons
    ├── sfx/                    Sound effects (menu_click.wav)
    ├── ui/                     Device frame image
    └── figma-ref/              Figma reference images (trainer, congrats gradient)
```

## Data Files (Required)

### mempool.json

Object keyed by 3-digit dex ID (`"001"` through `"144"`). Each entry contains:

| Field | Description |
|---|---|
| `name` | Creature name |
| `type` | Array of type strings |
| `stage` | Evolution stage number |
| `evolution` | Array of evolution targets |
| `base_memory` | Base memory stat |
| `memcore_needed_from_current_stage` | Memcore cost to evolve from this stage |
| `max_memcore` | Maximum memcore capacity |
| `sanctuary_yield` | Yield when placed in sanctuary |
| `rarity` | Rarity tier |
| `mintable` | Whether it can be bonded on-chain |
| `max_supply_mintable` | Max supply if mintable |
| `source_supply` | Source supply count |
| `memorandum_essence_points` | Essence point value |
| `height` | Creature height |
| `weight` | Creature weight |
| `source` | Origin source |
| `description` | Flavor text |

### memory_spawn_ranges.json

Object keyed by biome type (`EARTH`, `FIRE`, etc.). Each biome has a `ranges` array with entries:

```json
{ "dex_id": "001", "range_start": 0, "range_end": 15 }
```

The range values define weighted encounter probabilities within each biome.

## Asset Requirements

| Asset | Path Pattern | Example |
|---|---|---|
| Creature sprites | `assets/memories/<dex>.png` | `assets/memories/001.png` through `assets/memories/144.png` |
| Akronite (shiny) variants | `assets/memories/<dex>s.png` | `assets/memories/001s.png` |
| Type icons | `assets/icons/<Type>.png` | `assets/icons/Earth.png`, `assets/icons/Fire.png` |
| Spirit icons | `assets/spirits/<type>.png` | `assets/spirits/fire.png`, `assets/spirits/water.png` |

## Game Mechanics

### Discovery
Encountering a creature marks it as **seen** — it appears as a silhouette in the collection grid.

### Saving
First capture makes it **owned** — full color sprite, permanently unlocked. Historical ownership means once owned, always shown in full color even after evolution.

### Leveling
Memcore (◆) accumulates per evolution family. Spend memcore to level up individual creatures.

### Evolution
At max level with the required spirit, a creature evolves to its next stage. The instance transforms in place (same slot, new form).

### Bonding (NFT)
At max level, mintable creatures can be **bonded on-chain** — the prototype's NFT minting mechanic.

### Collection Views
- **Bonded Mode**: Shows only creatures that have been bonded, with its own completion percentage
- **Memories Mode**: Shows all discovered/owned creatures with separate completion tracking

## Tuner Panels (Dev Only)

Six tuner panels are available during development for fine-tuning layout values:

| Panel | Code | Purpose |
|---|---|---|
| Congrats | CG | Congratulations screen layout |
| Grid | GT | Main mempool grid layout |
| Detail | DT | Detail/collection page layout |
| Instance | IT | Instance card modal layout |
| 3D Grid | G3D | 3D perspective grid on instance cards |
| Type Overview | TOV | Type overview screen layout |

Each panel includes a readout with a copy button for sharing current values. All panels are collapsible. Tuners are **hidden by default** — append `?dev` to the URL to enable them (e.g., `https://your-app.vercel.app/?dev`).

## Deployment (Vercel)

No build step needed — the project is purely static files.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time — will prompt for project setup)
vercel

# Deploy to production
vercel --prod
```

The `vercel.json` config sets long-lived cache headers on all assets and serves the site as-is from the root directory.

## Hooking Up Your Own Data

For a developer taking over the project:

1. **Creature definitions** — Replace `mempool.json` with your own data (same schema)
2. **Spawn tables** — Replace `memory_spawn_ranges.json` with your biome encounter tables
3. **Sprites** — Add creature images to `assets/memories/` matching 3-digit dex IDs
4. **Trainer art** — Update `assets/figma-ref/trainer_image.png`
5. **Logos** — Replace files in `assets/logo/`
6. **Persistence** — Player state (`S` object in `js/state.js`) is currently ephemeral. Wire up your own persistence (localStorage, API, etc.) by saving/loading the `S` object

## Script Load Order

The JS files must be loaded in `index.html` in this exact order (dependencies flow top-down):

1. `sfx.js`
2. `tuners.js`
3. `animation.js`
4. `type-overview.js`
5. `data.js`
6. `state.js`
7. `data-loader.js`
8. `navigation.js`
9. `helpers.js`
10. `instance-card.js`
11. `encounter.js`
12. `render.js`
13. `detail.js`
14. `game-actions.js`
15. `grid-tuner.js`
16. `detail-tuner.js`
17. `instance-tuner.js`
18. `scroll.js` — calls `loadData()` at the end, bootstrapping the entire app

## Notes

- All state is session-only. Refreshing the page resets everything. No localStorage or backend persistence is implemented yet.
- The Vercel demo is read-only — visitors can interact freely without affecting any shared state.
- The device frame (`assets/ui/device.png`) simulates a phone screen; all game content renders inside the `#screen-area` container.
