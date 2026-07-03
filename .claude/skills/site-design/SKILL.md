---
name: site-design
description: Michael's design rules for this personal site. Use for ANY UI/styling/animation change in this repo — palette, cards, hover states, borders, buttons, motion.
---

# Site design rules (michaelzoubkoff personal site)

Non-negotiable rules Michael has given for this site. Apply them to every UI change.

## Cards & surfaces
- **Cards NEVER show a border highlight on hover.** No `border-color` change on `:hover` or focus/active states. Depth comes from soft glow `box-shadow` instead (shadows over borders).
- Card media (images/videos) must fill their container: `object-fit:cover`, top-anchored.
- Nested radii are concentric: `outerRadius = innerRadius + padding`.
- Images get a subtle inset outline: `inset 0 0 0 1px rgba(0,0,0,.1)` (pure black, never tinted).

## Color
- Cold palette only: icy white paper `#fafcff`, deep navy ink `#0f1c30`, **super light blue** accent `#a6ceff`.
- **No blue text and no blue icons.** Blue appears only as washes, borders-at-rest, and glow.
- Glow is a rare signature, not a system (recalibrated July 2026 against fredrika.dev / ibelick.com / jakub.kr / raphaelsalaja.com): it lives ONLY on the dot-matrix mark (bloom) and the glowing period after the name. Segment selector, cards, buttons, and links use neutral gray shadows (`rgba(15,28,48,…)`) — never blue glow.

## Taste calibration (from the four reference sites Michael loves)
- Open with the **name**, small and semibold (~20px) — never a display-size slogan headline. The statement goes in 15px muted body text.
- Chrome is grayscale; only project media brings color. Cards are white with `--line` hairlines and a faint neutral resting shadow.
- Section labels are small sentence-case gray text (like "Now"), not uppercase mono eyebrows.

## Shape
- **No fully rounded buttons** (`999px` pills or circles) — use ~10px radius.

## Icons
- Icon library is `react-icons`: `react-icons/fa6` for brands (FaXTwitter, FaGithub, FaLinkedinIn), `react-icons/lu` (Lucide) for UI icons (arrows, objects). Never use unicode arrows (↗ ↓) or emoji as icons.
- Icon-only links need `aria-label`; decorative icons get `aria-hidden`.
- The segment selector includes a Music tab that renders the 3D listening graph inline (`.music-embed`); the Now panel's "On repeat" row has a tiny gray CSS equalizer — the panel's one personality touch, keep it quiet.

## Layout / interaction
- Keep the All/Engineering/Writing segment selector and the scroll-to-focus zoom interaction on the homepage.
- Top-left mark is a dot-matrix loader (shadcn registry files in `src/components/ui/`).

## Motion (follow `.agents/skills/` — make-interfaces-feel-better, emil-design-eng, 12-principles-of-animation, baseline-ui)
- Entrances `ease-out` (site token `--ease-out`), interaction feedback ≤ 300ms.
- Press feedback: `scale(.96)` on buttons (cards may use `.98`); never below `.95`.
- Transition only specific properties (never `all`); prefer transform/opacity.
- Stagger ≤ 50ms per item; `AnimatePresence initial={false}`; respect `prefers-reduced-motion`.
- Hover effects gated behind `@media (hover:hover) and (pointer:fine)`.
- Use `dvh` (with `vh` fallback line) instead of bare `vh` for full-height layout.
