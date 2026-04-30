Memories Assets - Final Standardized Naming Convention
======================================================

This folder contains finalized Memory assets and supporting data files, organized with a consistent naming convention for development use.

-----------------------------------------------------
Folder Structure
-----------------------------------------------------

2d/
    Regular and Akronite full art Memory illustrations.
    Examples:
      001.png         -> Regular
      001s.png        -> Akronite

pixel/
    Static pixel sprites.
    Examples:
      001_pixel.png
      001s_pixel.png

pixel_animated/
    Animated pixel sprites (GIFs).
    Examples:
      001_pixel_animated.gif
      001s_pixel_animated.gif

pixel_animated_shadow/
    Animated pixel sprites with transparent / no-background shadow treatment (GIFs).
    Examples:
      001_pixel_animated_shadow.gif
      001s_pixel_animated_shadow.gif

concept/
    Concept art illustrations.
    Examples:
      001_concept.png
      001s_concept.png

mempool.json
    Master Memory data dump used for live game logic.
    Contains structured per-Memory metadata such as:
      - dex ID
      - name
      - typing
      - description / lore
      - source
      - stage
      - evolution targets
      - base memory
      - memcore requirements
      - rarity
      - mintability
      - mintable supply
      - sanctuary memcore yield
      - memorandum essence points
      - physical stats such as height / weight

memory_spawn_ranges.json
    Spawn RNG lookup tables generated from the Mempool sheet.
    Contains separate spawn mappings for each biome / primary type:
      - EARTH
      - FIRE
      - WIND
      - WATER
      - ELECTRIC
      - SOUL
      - AETHER
      - VOID
      - MIND
      - ASTRAL

    Each type contains:
      - total_weight
      - count
      - ranges[]

    Each range entry contains:
      - dex_id
      - weight
      - chance
      - range_start
      - range_end

-----------------------------------------------------
Naming Convention
-----------------------------------------------------

- Files use a three-digit Memory ID (001 -> 144).
- `s` suffix indicates Akronite version.
- Asset type is indicated in the suffix:
    - none = full 2D art
    - _pixel
    - _pixel_animated
    - _pixel_animated_shadow
    - _concept

Format:
    [###][s?][_asset-type].[ext]

Examples:
    042.png
    042s.png
    042_pixel.png
    042s_pixel.png
    042_pixel_animated.gif
    042s_pixel_animated.gif
    042_pixel_animated_shadow.gif
    042s_pixel_animated_shadow.gif
    042_concept.png
    042s_concept.png

-----------------------------------------------------
Data File Notes
-----------------------------------------------------

mempool.json
    This file is the structured Memory reference layer.
    It centralizes Memory identity and gameplay metadata in one place.

    Example structure:
      "004": {
        "name": "Nimphie",
        "source": "save",
        "type": ["EARTH", "WATER"],
        "description": "...",
        "stage": 1,
        "stage_label": "stage_1",
        "is_solo": false,
        "evolution": [...],
        "base_memory": "004",
        "memcore_to_evolve": 25,
        "memcore_needed_from_current_stage": 25,
        "memcore_required_for_next_evo": 50,
        "max_memcore": 50,
        "grant_at_max_memcore": false,
        "is_one_off_reward": false,
        "rarity": "common",
        "mintable": true,
        "max_supply_mintable": 2300,
        "sanctuary_yield": 2,
        "memorandum_essence_points": 8,
        "height": 50.0,
        "weight": 50.0
      }

    Notes:
      - `memorandum_essence_points` is the base Essence value used in encounter / mint logic.
      - `sanctuary_yield` is the memcore yield when gifting that Memory to Akronia's Sanctuary.
      - `evolution` entries contain target dex IDs and any spirit requirement.
      - `source` distinguishes normal wild-save rows, special rows, trades, etc.
      - `grant_at_max_memcore` and `is_one_off_reward` are helper flags for live game handling.

memory_spawn_ranges.json
    This file is intended for runtime RNG / encounter logic.

    Spawn tables are grouped by biome / primary type only.
    Each biome resolves independently to its own normalized 0.0 -> 1.0 range table.

    Spawn ranges were generated from the Mempool sheet using these filters:
      - primary typing from the biome column
      - supply / spawn weight from the source sheet
      - only rows intended for wild saving / encounter flow
      - rows without a valid positive spawn supply were excluded
      - each biome total is normalized independently to 100%

-----------------------------------------------------
RNG Spawn Logic - Short How To
-----------------------------------------------------

When a player enters a fully charged biome, use that biome's table in `memory_spawn_ranges.json`.

Recommended live encounter flow:

1. Roll #1: Memory selection
   - Generate a random decimal from 0.0 to 1.0
   - Use sufficient precision to match the stored range values
   - Find the entry in that biome's `ranges[]` where:
       range_start <= roll < range_end
   - That entry's `dex_id` is the spawned Memory

2. Roll #2: Akronite check
   - Generate a separate RNG roll for Akronite
   - Current chance: 1%
   - If true, use the `s` asset versions:
       001s.png
       001s_pixel.png
       etc.

3. Roll #3: Personality
   - Generate a separate RNG roll for personality
   - Current personalities:
       bashful
       brave
       bubbly
       grumpy
   - Personality is cosmetic only

4. Check wardrobe match
   - If the player's equipped wardrobe matches the biome / Memory requirement, apply the wardrobe multiplier to Essence
   - Wardrobe affects Essence, not identity

5. Roll wow factor
   - Roll the rarity-based wow multiplier
   - This affects the final revealed Essence amount

6. Compute revealed Essence
   - Pull base `memorandum_essence_points` from `mempool.json`
   - Apply:
       - Akronite multiplier if shiny
       - wardrobe multiplier if matched
       - rarity-based wow multiplier
   - Result becomes the instance's revealed Essence value

7. Construct the spawned Memory instance
   - Use `dex_id` to fetch full metadata from `mempool.json`
   - Use the same `dex_id` to fetch the correct asset files
   - If Akronite, use the shiny / `s` asset variants
   - Store runtime instance properties such as:
       - dex_id
       - personality
       - Akronite flag
       - revealed Essence
       - saved_stage
       - current_stage
       - origin_state = "saved"
       - is_nft = false

Example:
    Player enters EARTH biome
    Roll #1 = 0.0030000000
    Check EARTH ranges
    If 0.0030000000 falls inside 001's range, spawn dex_id 001
    Roll #2 checks whether it is regular or Akronite
    Roll #3 assigns personality
    Then check wardrobe
    Then roll wow factor
    Then calculate the final revealed Essence
    Then fetch:
      - metadata from `mempool.json`
      - assets from the corresponding dex ID files
    Then create that Memory in the player's inventory / mempool

-----------------------------------------------------
Important Gameplay Logic Notes
-----------------------------------------------------

- A wild-caught Memory starts with:
    - `saved_stage` = stage it was caught at
    - `current_stage` = same as saved_stage
    - `origin_state` = "saved"
    - `is_nft` = false

- If a Memory evolves:
    - `current_stage` changes
    - `origin_state` becomes "evolved"
    - `saved_stage` does not change

- If a Memory is minted:
    - `is_nft` becomes true
    - it should move to the NFT panel / NFT tab in the UI
    - minting does not overwrite provenance fields

- This allows the game to permanently distinguish:
    - a stage 2 or stage 3 Memory caught directly in the wild
    - versus a stage 1 Memory that was later evolved

- NFT mint price is based on the specific instance's revealed Essence / NFT Essence outcome, so the player knows what they are getting before minting.

-----------------------------------------------------
Special IDs / Nonstandard Acquisition
-----------------------------------------------------

These are not normal biome-farmable encounter rows:

Milestone rewards:
    138 -> Milestone 25
    090 -> Milestone 50
    091 -> Milestone 75
    071 -> Milestone 100
    144 -> Milestone 143 / full completion reward

NPC trade / quest rewards:
    070
    102

Notes:
- 144 is a special one-off completion reward and should be handled explicitly in game logic.
- 144 also grants the completionist wardrobe.
- These rows should not be treated as standard wild biome spawns.

-----------------------------------------------------
Migration Notes
-----------------------------------------------------

- These assets were migrated from the previous `Metamon_Assets_Final` structure into the updated `Memories_Assets_Final` structure.
- Legacy Metamon dex numbering was remapped into the new Memory dex ordering.
- Removed legacy entries were intentionally excluded.
- Original source files remain in the old Drive location for reference and archival purposes.
- This folder should be treated as the current source of truth for development.

-----------------------------------------------------
Notes
-----------------------------------------------------

- IDs 001-144 are covered for active Memories.
- Akronite variants are marked with `s`.
- File names are standardized so scripts, pipelines, and game integrations can reliably reference them across all asset folders.
- Asset filenames and JSON dex IDs are intentionally aligned to keep lookup logic simple and deterministic.
- Avoid manual renaming outside this convention unless all dependent references are updated as well.