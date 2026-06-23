'use client';

/**
 * CongratulationsOverlay
 * ----------------------
 * A generic, self-contained port of the Memorandum Mempool "Congratulations"
 * capture banner. No game state, DOM lookups, or asset maps are baked in — the
 * caller passes the resolved values (memory type, essence, image URL, etc.) as
 * props and the overlay renders the matching composition.
 *
 * Drop into a Next.js app (App Router or Pages Router). It is a Client Component
 * because it owns interaction (Escape-to-close, focus, ambient motes).
 *
 * Render it ABOVE the Godot canvas rather than inside an iframe — see README.md.
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import styles from './CongratulationsOverlay.module.css';

/* ── Type/color data (ported from the prototype's helpers.js / data.js) ──────
   Bundled so the component works standalone; every map can be overridden via
   props (bannerColors, badges) when the host app owns its own palette. */

export type MemoryType =
  | 'EARTH'
  | 'FIRE'
  | 'WIND'
  | 'WATER'
  | 'ELECTRIC'
  | 'SOUL'
  | 'AETHER'
  | 'VOID'
  | 'MIND'
  | 'ASTRAL';

/** Primary type → [c1, c2] banner gradient stops. */
const TYPE_GRADIENTS: Record<MemoryType, [string, string]> = {
  AETHER: ['#5969AF', '#A9BABC'],
  ASTRAL: ['#400CA2', '#7746D3'],
  EARTH: ['#B36B34', '#C9AC73'],
  ELECTRIC: ['#EDC33F', '#F9E99E'],
  FIRE: ['#EA4D00', '#F78B32'],
  MIND: ['#FFA2E7', '#AE68C1'],
  SOUL: ['#CC58AB', '#FFA2E7'],
  VOID: ['#2F1945', '#3B376D'],
  WATER: ['#2699D2', '#85D5F7'],
  WIND: ['#8EEDDB', '#D3FCF9'],
};

const RARITY_COLORS: Record<string, string> = {
  common: '#A0A0A8',
  uncommon: '#38A838',
  rare: '#2860D8',
  epic: '#8030C8',
  legendary: '#C88010',
};

const PERSONALITY_COLORS: Record<string, string> = {
  brave: '#E05020',
  bubbly: '#D060B0',
  bashful: '#2E8FD8',
  grumpy: '#8A4FCC',
};

const DEFAULT_GRADIENT: [string, string] = TYPE_GRADIENTS.WATER;

/* ── Public types ──────────────────────────────────────────────────────── */

export interface CongratsBadge {
  label: string;
  /** Background color (any CSS color). */
  bg?: string;
  /** Text color. */
  fg?: string;
  /** Border color. */
  border?: string;
}

export interface CongratulationsOverlayProps {
  /** Controls mount/visibility. When false, nothing renders. */
  open: boolean;

  /** Drives the banner gradient. Unknown/omitted falls back to WATER. */
  memoryType?: MemoryType | string;
  /** Explicit [c1, c2] gradient override. Wins over `memoryType`. */
  bannerColors?: [string, string];

  /** Resolved sprite/image URL for the memory. */
  imageSrc?: string;
  imageAlt?: string;

  /** Memory display name. Also used as the faint watermark behind the sprite. */
  name?: string;
  /** Appends a ★ to the name and adds an "Akronite" badge. */
  isShiny?: boolean;

  /** e.g. "common" → a "COMMON" badge tinted by rarity. */
  rarity?: string;
  /** e.g. "brave" → a personality badge. */
  personality?: string;
  /**
   * Fully override the badge row. When provided, the automatic
   * shiny/rarity/personality badges are skipped.
   */
  badges?: CongratsBadge[];

  /** Reward column. Omit a value to hide that line. */
  essence?: number;
  /** The "+N ◆" memcore line. */
  memcoreGain?: number;
  /** e.g. "NICE" | "BIG WOW" | "HUGE WOW" — color is inferred from the text. */
  wowLabel?: string;

  /** Defaults to "Congratulations". */
  title?: string;
  /** Defaults to "A new memory has been etched into your collection". */
  subtitle?: string;

  /** CTA label. Defaults to "View in Mempool". */
  primaryLabel?: string;
  /** CTA click handler. */
  onPrimary?: () => void;
  /** Close handler (×, backdrop click, or Escape). */
  onClose?: () => void;

  /** Ambient mote count in the banner. Default 20. 0 disables. */
  moteCount?: number;
  /** Close-button icon URL. Falls back to a built-in inline SVG. */
  closeIconSrc?: string;
  /** Close when the dark backdrop is clicked. Default true. */
  closeOnBackdrop?: boolean;

  /** Extra class on the root element. */
  className?: string;
  /** Inline style overrides on the root (e.g. `--cg-font`, layout vars). */
  style?: CSSProperties;
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Deterministic-enough RNG seeded from a string so SSR/CSR agree per mount. */
function makeRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

interface Mote {
  c: string;
  left: string;
  top: string;
  size: string;
  opacity: number;
  delay: string;
  dur: string;
  twinkle: string;
}

/** Port of fillAmbientMotes() — banner motes with drift + twinkle. */
function buildMotes(color1: string, color2: string, count: number, seed: number): Mote[] {
  const n = Math.max(0, Math.min(48, count));
  const rng = makeRng(seed);
  const motes: Mote[] = [];
  for (let i = 0; i < n; i++) {
    const c = rng() < 0.52 ? color1 : rng() < 0.72 ? color2 : '#fff';
    const near = rng() < 0.64;
    const cx = near ? 14 + rng() * 40 : 8 + rng() * 84;
    const cy = near ? 18 + rng() * 56 : 6 + rng() * 86;
    const size = near ? 2.2 + rng() * 2.6 : 1.4 + rng() * 2.2;
    motes.push({
      c,
      left: `${cx}%`,
      top: `${cy}%`,
      size: `${size}px`,
      opacity: near ? 0.38 + rng() * 0.28 : 0.16 + rng() * 0.22,
      delay: `${-(rng() * 24)}s`,
      dur: `${12 + rng() * 16}s`,
      twinkle: `${3 + rng() * 4}s`,
    });
  }
  return motes;
}

function wowClass(label: string): string {
  const up = label.toUpperCase();
  if (up.includes('HUGE')) return styles.wowHuge;
  if (up.includes('BIG')) return styles.wowBig;
  return styles.wowNice;
}

/** Build the default badge row from shiny/rarity/personality, like showCongrats(). */
function autoBadges(
  isShiny: boolean,
  rarity?: string,
  personality?: string,
): CongratsBadge[] {
  const out: CongratsBadge[] = [];
  if (isShiny) {
    out.push({
      label: '★ Akronite',
      bg: 'rgba(255,215,0,0.38)',
      fg: '#FFD700',
      border: 'rgba(255,215,0,0.55)',
    });
  }
  if (rarity) {
    const rc = RARITY_COLORS[rarity.toLowerCase()] || '#888888';
    out.push({ label: capitalize(rarity), bg: `${rc}50`, fg: 'white', border: `${rc}80` });
  }
  if (personality) {
    const pc = PERSONALITY_COLORS[personality.toLowerCase()] || '#888888';
    out.push({ label: personality, bg: `${pc}45`, fg: 'white', border: `${pc}70` });
  }
  return out;
}

/* ── Component ─────────────────────────────────────────────────────────── */

export default function CongratulationsOverlay({
  open,
  memoryType,
  bannerColors,
  imageSrc,
  imageAlt,
  name = '',
  isShiny = false,
  rarity,
  personality,
  badges,
  essence,
  memcoreGain,
  wowLabel,
  title = 'Congratulations',
  subtitle = 'A new memory has been etched into your collection',
  primaryLabel = 'View in Mempool',
  onPrimary,
  onClose,
  moteCount = 20,
  closeIconSrc,
  closeOnBackdrop = true,
  className,
  style,
}: CongratulationsOverlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const reactId = useId();

  // Resolve banner gradient: explicit override → type map → WATER.
  const [c1, c2] = useMemo<[string, string]>(() => {
    if (bannerColors) return bannerColors;
    const key = (memoryType || '').toString().toUpperCase() as MemoryType;
    return TYPE_GRADIENTS[key] || DEFAULT_GRADIENT;
  }, [bannerColors, memoryType]);

  // Motes are random; build them on the client only to avoid SSR hydration drift.
  const [motes, setMotes] = useState<Mote[]>([]);
  useEffect(() => {
    if (!open || moteCount <= 0) {
      setMotes([]);
      return;
    }
    let seed = 0;
    for (let i = 0; i < reactId.length; i++) seed = (seed * 31 + reactId.charCodeAt(i)) >>> 0;
    setMotes(buildMotes(c1, c2, moteCount, seed + Math.floor(Date.now())));
  }, [open, moteCount, c1, c2, reactId]);

  // Escape to close + focus the close button on open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };
    document.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  const handleBackdrop = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
    },
    [closeOnBackdrop, onClose],
  );

  if (!open) return null;

  const displayName = name + (isShiny ? ' ★' : '');
  const badgeList = badges ?? autoBadges(isShiny, rarity, personality);

  const stripStyle = {
    ['--cg-c1' as string]: c1,
    ['--cg-c2' as string]: c2,
  } as CSSProperties;

  // CTA gradient derived from the banner colors (matches the prototype).
  const ctaStyle: CSSProperties = {
    background: `linear-gradient(135deg, ${c1}, color-mix(in srgb, ${c1} 55%, ${c2}) 45%, ${c2})`,
    borderColor: `color-mix(in srgb, ${c2} 55%, rgba(0,0,0,0.2))`,
    color: '#fff',
    boxShadow:
      '0 2px 12px rgba(0,0,0,0.16), 0 0 16px color-mix(in srgb, ' +
      c1 +
      ' 25%, transparent), inset 0 1px 0 rgba(255,255,255,0.35)',
  };

  const hasReward = essence != null || memcoreGain != null || (wowLabel && wowLabel.length > 0);

  return (
    <div
      className={[styles.overlay, className].filter(Boolean).join(' ')}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={handleBackdrop}
    >
      <button
        type="button"
        ref={closeRef}
        className={styles.close}
        onClick={onClose}
        aria-label="Close"
      >
        {closeIconSrc ? (
          <img src={closeIconSrc} alt="" className={styles.closeImg} />
        ) : (
          <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
            <path
              d="M9 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4M14 9l7-7m0 0h-5m5 0v5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* 1. Background strip — dynamic type-colored banner */}
      <div className={styles.strip} style={stripStyle}>
        <div className={styles.bannerMain} />
        <div className={styles.bannerTopLine} />
        <div className={styles.bannerTopGlow} />
        <div className={styles.bannerBotLine} />
        <div className={styles.bannerBotGlow} />
        <div className={styles.bannerMotes} aria-hidden="true">
          {motes.map((m, i) => (
            <div
              key={i}
              className={styles.mote}
              style={
                {
                  left: m.left,
                  top: m.top,
                  width: m.size,
                  height: m.size,
                  opacity: m.opacity,
                  animationDelay: m.delay,
                  ['--mote-c' as string]: m.c,
                  ['--mote-dur' as string]: m.dur,
                  ['--mote-twinkle' as string]: m.twinkle,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>

      {/* 2. Creature image + watermark name behind sprite */}
      <div className={styles.creatureZone}>
        {name ? (
          <div className={styles.nameWm} aria-hidden="true">
            {displayName}
          </div>
        ) : null}
        {imageSrc ? <img className={styles.creatureImg} src={imageSrc} alt={imageAlt ?? name} /> : null}
      </div>

      {/* 3. Badges */}
      {badgeList.length > 0 ? (
        <div className={styles.badgesZone}>
          {badgeList.map((b, i) => (
            <span
              key={i}
              className={styles.badge}
              style={
                {
                  ['--cg-b-bg' as string]: b.bg,
                  ['--cg-b-fg' as string]: b.fg,
                  ['--cg-b-br' as string]: b.border,
                } as CSSProperties
              }
            >
              {b.label}
            </span>
          ))}
        </div>
      ) : null}

      {/* 4. Text block */}
      <div className={styles.content}>
        {name ? <div className={styles.memName}>{displayName}</div> : null}
        <div className={styles.title}>{title}</div>
        {subtitle ? (
          <div className={styles.subtitleRow}>
            <div className={styles.subtitle}>{subtitle}</div>
          </div>
        ) : null}
      </div>

      {/* 5. Essence / memcore reward */}
      {hasReward ? (
        <div className={styles.reward}>
          {memcoreGain != null ? <div className={styles.rewardMc}>{`+${memcoreGain} ◆`}</div> : null}
          {essence != null ? (
            <div className={styles.rewardEss}>
              <span className={styles.essVal}>{essence}</span>
              <span className={styles.essWord}>Essence</span>
            </div>
          ) : null}
          {wowLabel ? (
            <div className={[styles.rewardWow, wowClass(wowLabel)].join(' ')}>{wowLabel}</div>
          ) : null}
        </div>
      ) : null}

      {/* CTA */}
      <div className={styles.btns}>
        <button type="button" className={styles.btnPrimary} style={ctaStyle} onClick={onPrimary}>
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
