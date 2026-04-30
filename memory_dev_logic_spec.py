# =========================================================
# MEMORANDOM CORE MEMORY / ESSENCE / NFT LOGIC SPEC
# =========================================================
#
# PURPOSE
# -------
# Developer handoff for live gameplay logic.
# This is based on the current finalized simulator rules and data model.
#
# Primary data inputs:
# - memory_spawn_ranges.json
# - mempool.json
#
# This file focuses on the game rules needed to:
# - generate a wild Memory encounter
# - store the resulting instance
# - level it up via sanctuary memcore
# - evolve it
# - mint it into an NFT
# - redeem / recycle it for essence
#
# =========================================================
# SOURCE OF TRUTH NOTES
# =========================================================
# memory_spawn_ranges.json controls:
# - what can spawn in each biome
# - weighted chance per Memory
#
# mempool.json controls per dex:
# - rarity
# - stage
# - mintable
# - max_supply_mintable
# - memorandum_essence_points
# - sanctuary_yield
# - base_memory
# - memcore_to_evolve / memcore_required_for_next_evo
# - evolution targets and required spirit
#
# IMPORTANT DISTINCTIONS
# ----------------------
# - Personality is cosmetic only.
# - Shiny DOES affect essence.
# - Matching wardrobe DOES affect essence.
# - Wow roll DOES affect essence.
# - Minting does NOT reroll encounter values.
# - Minting does NOT overwrite instance provenance.
# - Evolving does NOT create a fresh encounter. It upgrades an existing instance.
#
# =========================================================
# SPECIAL REWARD / QUEST / MILESTONE RULES
# =========================================================
# These dex IDs are not regular biome-farmable wild captures:
# - 070 = NPC quest trade reward
# - 102 = NPC quest trade reward
# - 138 = Milestone 25 reward
# - 090 = Milestone 50 reward
# - 091 = Milestone 75 reward
# - 071 = Milestone 100 reward
# - 144 = Milestone 143 reward (full saved collection complete)
#
# Milestone meanings:
# - Milestone 25 = player has saved 25 unique Memory dex IDs in the mempool
# - Milestone 50 = player has saved 50 unique Memory dex IDs
# - Milestone 75 = player has saved 75 unique Memory dex IDs
# - Milestone 100 = player has saved 100 unique Memory dex IDs
# - Milestone 143 = player has saved all 143 non-Akronia Memory dex IDs
#
# Special 144 completion reward:
# - grant dex 144 Akronia
# - also grant the completionist wardrobe
#
# 070 and 102:
# - should be obtained through dedicated NPC trade / quest logic
# - exact trade cost can be implemented separately (essence, items, quest flags, etc.)
#
# =========================================================
# INSTANCE PROVENANCE RULE
# =========================================================
# Every Memory instance should permanently preserve where its current stage came from.
# This is how the game differentiates a rare stage-2 wild catch from a stage-1 Memory
# that was later evolved into stage 2.
#
# Recommended instance fields:
# - saved_stage: stage at the time the instance was originally caught / saved
# - current_stage: current live stage after any evolution
# - origin_state: one of ["saved", "evolved"]
# - is_nft: bool
#
# Rules:
# - A Memory caught in the wild is created with origin_state="saved"
# - saved_stage is set once and never changes
# - current_stage changes if the Memory evolves
# - if the Memory evolves at least once, origin_state becomes "evolved"
# - minting sets is_nft=True but does NOT change saved_stage or origin_state
# - can_mint checks should key off the saved stage / saved provenance
#
# Result:
# - a wild caught stage-2 Memory can stay identifiable forever as a saved stage-2 catch
# - a stage-1 Memory evolved into stage 2 stays identifiable as evolved
#
# =========================================================

from __future__ import annotations

import random
from typing import Any


# =========================================================
# CORE CONSTANTS (CURRENT ECONOMY BASELINE)
# =========================================================

SHINY_CHANCE = 0.01

PERSONALITIES = (
    "brave",
    "bubbly",
    "bashful",
    "grumpy",
)
# Equal 25% each.
# Cosmetic only. No effect on essence, mint price, or evolution.

WARDROBE_REVEAL_MULTIPLIER = 1.20
# Apply only if the player's equipped wardrobe matches the shrine biome.
# In the live game this should be a deterministic check, not a random roll.

NFT_STATIC_MULTIPLIER = 1.80
# Applied only when a saved/evolved Memory is minted into an NFT.

SHINY_REVEAL_MULTIPLIER = {
    "common": 2.60,
    "uncommon": 2.35,
    "rare": 2.35,
    "legendary": 2.05,
}

# Gives a randomized wow factor variation based on rarity.
WOW_TABLES = {
    "common": [
        (1.00, 1.10, 0.50),
        (1.11, 1.26, 0.255),
        (1.27, 1.58, 0.150),
        (1.59, 2.18, 0.070),
        (2.19, 3.35, 0.022),
        (3.36, 5.75, 0.003),
    ],
    "uncommon": [
        (1.00, 1.10, 0.48),
        (1.11, 1.25, 0.255),
        (1.26, 1.54, 0.160),
        (1.55, 2.08, 0.075),
        (2.09, 3.15, 0.026),
        (3.16, 4.95, 0.004),
    ],
    "rare": [
        (1.00, 1.08, 0.270),
        (1.09, 1.24, 0.240),
        (1.25, 1.52, 0.230),
        (1.53, 2.12, 0.155),
        (2.13, 3.20, 0.075),
        (3.21, 5.40, 0.030),
    ],
    "legendary": [
        (1.00, 1.06, 0.290),
        (1.07, 1.18, 0.220),
        (1.19, 1.44, 0.215),
        (1.45, 2.08, 0.155),
        (2.09, 3.35, 0.080),
        (3.36, 5.30, 0.040),
    ],
}

# UI / dialog labels only. No extra math beyond the rolled multiplier itself.
WOW_BUCKET_THRESHOLDS = {
    "nice_hit": 1.25,
    "big_hit": 1.75,
    "holy_shit": 2.50,
}

EVOLUTION_CONFIG = {
    "family_bonus_two_tier": 1.10,
    "family_bonus_three_tier": 1.04,
    "stage_two_to_three_bonus": 1.02,
    "spirit_infusion_multiplier": 1.18,
    "memcore_baseline": 30,
    "memcore_bonus_per_30": 0.015,
    "memcore_bonus_cap": 0.120,
}

EVOLUTION_WOW_TABLES = {
    "common": [
        (1.04, 1.10, 0.38),
        (1.11, 1.18, 0.27),
        (1.19, 1.29, 0.17),
        (1.30, 1.45, 0.10),
        (1.46, 1.66, 0.06),
        (1.67, 1.95, 0.02),
    ],
    "uncommon": [
        (1.05, 1.12, 0.36),
        (1.13, 1.21, 0.27),
        (1.22, 1.34, 0.18),
        (1.35, 1.52, 0.10),
        (1.53, 1.78, 0.06),
        (1.79, 2.10, 0.03),
    ],
    "rare": [
        (1.06, 1.13, 0.33),
        (1.14, 1.24, 0.26),
        (1.25, 1.38, 0.19),
        (1.39, 1.58, 0.12),
        (1.59, 1.88, 0.07),
        (1.89, 2.28, 0.03),
    ],
    "legendary": [
        (1.07, 1.15, 0.30),
        (1.16, 1.28, 0.24),
        (1.29, 1.45, 0.20),
        (1.46, 1.70, 0.14),
        (1.71, 2.05, 0.08),
        (2.06, 2.55, 0.04),
    ],
}

SPIRIT_EVOLUTION_WOW_TABLES = {
    "common": [
        (1.10, 1.18, 0.28),
        (1.19, 1.30, 0.24),
        (1.31, 1.46, 0.19),
        (1.47, 1.70, 0.13),
        (1.71, 2.05, 0.10),
        (2.06, 2.55, 0.06),
    ],
    "uncommon": [
        (1.11, 1.20, 0.26),
        (1.21, 1.34, 0.24),
        (1.35, 1.52, 0.19),
        (1.53, 1.78, 0.13),
        (1.79, 2.15, 0.11),
        (2.16, 2.70, 0.07),
    ],
    "rare": [
        (1.12, 1.22, 0.24),
        (1.23, 1.38, 0.23),
        (1.39, 1.58, 0.18),
        (1.59, 1.86, 0.14),
        (1.87, 2.30, 0.13),
        (2.31, 3.05, 0.08),
    ],
    "legendary": [
        (1.14, 1.26, 0.22),
        (1.27, 1.44, 0.22),
        (1.45, 1.68, 0.18),
        (1.69, 2.02, 0.15),
        (2.03, 2.55, 0.14),
        (2.56, 3.35, 0.09),
    ],
}

SPECIAL_NONSPAWN_REWARD_IDS = {"070", "071", "090", "091", "102", "138", "144"}


# =========================================================
# LIVE GAME ORDER OF OPERATIONS: WILD ENCOUNTER
# =========================================================
# 1. Player fully charges a biome shrine and enters that biome.
# 2. Roll a Memory from that biome's weighted spawn table.
# 3. Pull static metadata for that dex from mempool.json.
# 4. Roll shiny.
# 5. Roll personality.
# 6. Check matching wardrobe.
# 7. Roll wow multiplier based on rarity.
# 8. Compute revealed essence.
# 9. Create and store the Memory instance with saved provenance.
#
# Formula:
# revealed_essence =
#   round(base_essence * shiny_multiplier * wardrobe_multiplier * wow_multiplier)
#
# Minimum result should be clamped to 1.
# =========================================================


def create_memory_encounter(
    player,
    biome_name: str,
    memory_spawn_ranges: dict[str, Any],
    mempool: dict[str, Any],
    rng: random.Random,
) -> dict[str, Any]:
    dex_id = weighted_roll_from_spawn_table(memory_spawn_ranges[biome_name]["ranges"], rng)
    memory_data = mempool[dex_id]

    base_essence = int(memory_data["memorandum_essence_points"])
    rarity = str(memory_data["rarity"])
    stage = int(memory_data.get("stage") or 0)

    is_shiny = rng.random() < SHINY_CHANCE
    shiny_multiplier = SHINY_REVEAL_MULTIPLIER[rarity] if is_shiny else 1.0

    personality = rng.choice(PERSONALITIES)

    wardrobe_matches = player_has_matching_wardrobe(player, biome_name, dex_id, memory_data)
    wardrobe_multiplier = WARDROBE_REVEAL_MULTIPLIER if wardrobe_matches else 1.0

    wow_multiplier = roll_weighted_multiplier(WOW_TABLES[rarity], rng)

    revealed_essence = max(
        1,
        round(base_essence * shiny_multiplier * wardrobe_multiplier * wow_multiplier),
    )

    return {
        "dex_id": dex_id,
        "name": memory_data["name"],
        "rarity": rarity,
        "personality": personality,
        "is_shiny": is_shiny,
        "wardrobe_match": wardrobe_matches,
        "base_essence": base_essence,
        "wow_multiplier": wow_multiplier,
        "revealed_essence": revealed_essence,
        "saved_stage": stage,
        "current_stage": stage,
        "origin_state": "saved",
        "is_nft": False,
        "nft_minted_at_stage": None,
        "nft_essence": None,
        "base_memory": memory_data.get("base_memory") or dex_id,
        "sanctuary_yield": memory_data.get("sanctuary_yield"),
        "mintable": bool(memory_data.get("mintable")),
        "max_supply_mintable": memory_data.get("max_supply_mintable"),
        "source": memory_data.get("source"),
        "type": memory_data.get("type", []),
        "evolution": list(memory_data.get("evolution", [])),
        "memcore_to_evolve": memory_data.get("memcore_to_evolve"),
        "memcore_required_for_next_evo": memory_data.get("memcore_required_for_next_evo"),
        "max_memcore": memory_data.get("max_memcore"),
    }


# =========================================================
# SAVED MEMORY INSTANCE RULES
# =========================================================
# A saved Memory is the non-NFT instance created from a wild encounter.
# It keeps its encounter-derived essence and provenance.
#
# PLAYER OPTIONS FOR A SAVED MEMORY
# 1. Keep it in inventory / Mempool collection.
# 2. Sell it to the MemoRandum NPC for its full current revealed_essence.
# 3. Gift it to Akronia's Sanctuary for sanctuary_yield memcore.
#    - Each base_memory memcore is stored as silent inventory.
#    - Display relevant family memcore on all stages of that family line.
# 4. If current stage max level is reached and mint allocation available, mint it into an NFT.
# 5. If eligible, evolve it, check spirit requirement, if memcore requirement met.
# =========================================================


def sell_to_memorandum(memory_instance: dict[str, Any]) -> int:
    return int(memory_instance["revealed_essence"])


def sanctuary_turn_in(memory_instance: dict[str, Any]) -> tuple[str, int]:
    base_memory_id = str(memory_instance["base_memory"])
    memcore_gain = int(memory_instance.get("sanctuary_yield") or 0)
    return base_memory_id, memcore_gain


# =========================================================
# NFT UI / PANEL RULE
# =========================================================
# NFTs should be displayed on a separate UI panel / tab from saved non-NFT Memories.
#
# Recommended UI split:
# - Mempool / Saved tab:
#   - non-NFT Memory instances
#   - uses 2D card logic / collection logic
#
# - NFT tab:
#   - only instances where is_nft == True
#   - should display the 3D asset / model for that Memory
#   - should preserve saved_stage / current_stage / origin_state metadata
#
# Minting should move or duplicate the instance into the NFT tab according to your inventory design,
# but it should NOT erase the provenance fields from the instance record.
# =========================================================


# =========================================================
# MINT LOGIC
# =========================================================
# Minting should NOT overwrite saved/evolved provenance.
# It adds permanent NFT status on top of the existing instance.
#
# Recommended mint gating:
# - instance is not already an NFT
# - dex is marked mintable in mempool
# - NFT cap for that dex has not been reached
# - current stage is at max level for that stage
#
# Important:
# - Minting uses the existing instance and its existing revealed_essence.
# - No shiny reroll.
# - No wardrobe reroll.
# - No wow reroll.
# - No personality reroll.
# - NFT essence is a static multiplier on revealed essence.
# =========================================================


def can_mint(
    memory_instance: dict[str, Any],
    minted_supply_by_dex: dict[str, int],
    is_current_stage_max_level: bool,
) -> bool:
    if memory_instance.get("is_nft"):
        return False

    if not memory_instance.get("mintable"):
        return False

    if not is_current_stage_max_level:
        return False

    saved_stage = int(memory_instance.get("saved_stage") or 0)
    if saved_stage <= 0:
        return False

    dex_id = str(memory_instance["dex_id"])
    cap = memory_instance.get("max_supply_mintable")
    if cap is None:
        return False

    minted_so_far = int(minted_supply_by_dex.get(dex_id, 0))
    return minted_so_far < int(cap)


def mint_memory(memory_instance: dict[str, Any], minted_supply_by_dex: dict[str, int]) -> dict[str, Any]:
    dex_id = str(memory_instance["dex_id"])
    cap = memory_instance.get("max_supply_mintable")
    if memory_instance.get("is_nft"):
        raise ValueError("Memory is already minted")
    if not memory_instance.get("mintable"):
        raise ValueError("Memory is not mintable")
    if cap is None:
        raise ValueError("Memory has no mint cap")
    if int(minted_supply_by_dex.get(dex_id, 0)) >= int(cap):
        raise ValueError("Mint cap reached for this dex")

    minted_supply_by_dex[dex_id] = int(minted_supply_by_dex.get(dex_id, 0)) + 1

    nft_essence = max(1, round(float(memory_instance["revealed_essence"]) * NFT_STATIC_MULTIPLIER))

    memory_instance["is_nft"] = True
    memory_instance["nft_minted_at_stage"] = int(memory_instance["current_stage"])
    memory_instance["nft_essence"] = nft_essence

    # Do NOT modify:
    # - saved_stage
    # - current_stage
    # - origin_state
    # Those fields preserve provenance.

    return memory_instance


# =========================================================
# EVOLUTION LOGIC
# =========================================================
# Evolving upgrades the existing instance.
# It changes current_stage and target dex, but should preserve the fact
# that the instance originally came from a saved wild encounter.
#
# Required conditions:
# - instance is not already an NFT
# - target_dex_id is one of the current instance's allowed evolution targets
# - if target requires a spirit, the correct spirit must be consumed
# - required family memcore must already be available
#
# Evolution formula:
# evolved_revealed = round(
#   max(source_revealed, target_base_essence)
#   * evo_roll
#   * family_scalar
#   * stage_scalar
#   * memcore_scalar
#   * spirit_scalar
# )
# =========================================================


def evolve_memory(
    memory_instance: dict[str, Any],
    target_dex_id: str,
    mempool: dict[str, Any],
    family_size: int,
    spirit_used: str | None,
    current_memcore: int,
    rng: random.Random,
) -> dict[str, Any]:
    if memory_instance.get("is_nft"):
        raise ValueError("Cannot evolve an NFT instance directly")

    target = mempool[target_dex_id]
    rarity = str(target["rarity"])

    target_base = int(target["memorandum_essence_points"])
    source_revealed = int(memory_instance["revealed_essence"])

    if spirit_used:
        evo_roll = roll_weighted_multiplier(SPIRIT_EVOLUTION_WOW_TABLES[rarity], rng)
        spirit_scalar = EVOLUTION_CONFIG["spirit_infusion_multiplier"]
    else:
        evo_roll = roll_weighted_multiplier(EVOLUTION_WOW_TABLES[rarity], rng)
        spirit_scalar = 1.0

    family_scalar = (
        EVOLUTION_CONFIG["family_bonus_three_tier"]
        if family_size >= 3
        else EVOLUTION_CONFIG["family_bonus_two_tier"]
    )

    stage_scalar = 1.0
    source_stage = int(memory_instance.get("current_stage") or 0)
    target_stage = int(target.get("stage") or 0)
    if source_stage == 2 and target_stage == 3:
        stage_scalar *= EVOLUTION_CONFIG["stage_two_to_three_bonus"]

    memcore_bonus_steps = max(0, int(current_memcore) - EVOLUTION_CONFIG["memcore_baseline"]) // 30
    memcore_bonus = min(
        memcore_bonus_steps * EVOLUTION_CONFIG["memcore_bonus_per_30"],
        EVOLUTION_CONFIG["memcore_bonus_cap"],
    )
    memcore_scalar = 1.0 + memcore_bonus

    evolved_revealed = max(
        1,
        round(
            max(source_revealed, target_base)
            * evo_roll
            * family_scalar
            * stage_scalar
            * memcore_scalar
            * spirit_scalar
        ),
    )

    memory_instance["dex_id"] = str(target_dex_id)
    memory_instance["name"] = target["name"]
    memory_instance["rarity"] = rarity
    memory_instance["type"] = target.get("type", [])
    memory_instance["base_memory"] = target.get("base_memory") or target_dex_id
    memory_instance["current_stage"] = int(target.get("stage") or 0)
    memory_instance["origin_state"] = "evolved"
    memory_instance["revealed_essence"] = evolved_revealed
    memory_instance["base_essence"] = target_base
    memory_instance["evolution"] = list(target.get("evolution", []))
    memory_instance["sanctuary_yield"] = target.get("sanctuary_yield")
    memory_instance["mintable"] = bool(target.get("mintable"))
    memory_instance["max_supply_mintable"] = target.get("max_supply_mintable")
    memory_instance["memcore_to_evolve"] = target.get("memcore_to_evolve")
    memory_instance["memcore_required_for_next_evo"] = target.get("memcore_required_for_next_evo")
    memory_instance["max_memcore"] = target.get("max_memcore")

    # Preserve saved provenance.
    # Do NOT modify saved_stage here.

    return memory_instance


# =========================================================
# IMPLEMENTATION NOTES FOR DEV
# =========================================================
# 1. saved_stage should be written once when the encounter is created.
# 2. origin_state should start as "saved".
# 3. Evolving sets origin_state="evolved" but should not touch saved_stage.
# 4. Minting sets is_nft=True but should not touch saved_stage or origin_state.
# 5. Direct stage-2 wild catches therefore remain distinguishable forever from
#    stage-1 catches that later evolved into stage 2.
# 6. NFT instances should appear in a separate NFT UI tab / panel.
# 7. NFT tab should render the 3D Memory asset.
# 8. Special IDs 070 / 071 / 090 / 091 / 102 / 138 / 144 are not regular
#    biome-farmable wild captures.
# 9. 144 Akronia is a special-case one-off completion reward row.
# 10. Milestone rewards should be granted off unique saved dex count, not total duplicates.


# =========================================================
# PLACEHOLDER HELPERS TO IMPLEMENT IN ENGINE / SERVER
# =========================================================


def weighted_roll_from_spawn_table(ranges, rng: random.Random) -> str:
    raise NotImplementedError


def player_has_matching_wardrobe(player, biome_name: str, dex_id: str, memory_data: dict[str, Any]) -> bool:
    raise NotImplementedError


def roll_weighted_multiplier(table, rng: random.Random) -> float:
    raise NotImplementedError
