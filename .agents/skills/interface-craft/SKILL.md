---
name: interface-craft
description: Compact interface design and review system synthesized from make-interfaces-feel-better, emil-design-eng, 12-principles-of-animation, and userinterface-wiki. Use when building, polishing, or auditing web UI typography, layout, spacing, surfaces, interaction, accessibility, or motion.
---

# Interface Craft

Apply the smallest set of changes that makes the interface feel intentional. Diagnose hierarchy and geometry before adding decoration or motion.

## Workflow

1. Inspect the real interface at the target viewport and read the existing design tokens and component patterns.
2. Name the dominant perceptual problem in one sentence.
3. Fix in this order: type, layout, spacing, surfaces, interaction, motion.
4. Re-render at desktop and mobile sizes. Check overflow, wrapping, focus, hover, press, and reduced motion.
5. Remove any detail that does not improve hierarchy, comprehension, feedback, or perceived quality.

When implementing, make the changes rather than stopping at recommendations. Preserve the product's visual language unless the user asks for a redesign.

## Type

- Choose a deliberate typeface and verify the actual loaded face and weights.
- Establish a restrained scale; avoid making body copy carry headline presence.
- Keep readable measures, usually 50-75 characters for prose.
- Use `text-wrap: balance` for headings and `text-wrap: pretty` for body copy.
- Keep optical sizing and contextual alternates enabled; prevent faux bold and italic.
- Apply antialiasing on Retina displays.
- Use tabular numerals for changing or aligned data and oldstyle numerals for prose when supported.
- Offset underlines below descenders. Add tracking only to uppercase or small caps, not ordinary prose.

## Layout and spacing

- Use proximity to express relationships: related items closer, sections distinctly farther apart.
- Work from a small consistent spacing scale. Avoid isolated arbitrary gaps.
- Judge composition at the initial viewport. The page should reveal its hierarchy without feeling zoomed or prematurely dense.
- Prefer one clear focal point. Reduce competing emphasis before adding new emphasis.
- Size targets to at least 40x40 CSS pixels, extending hit areas with non-overlapping pseudo-elements when needed.
- Use progressive disclosure and familiar patterns to control cognitive load.
- Align optically when geometric centering looks wrong.

## Surfaces

- For nested rounded surfaces, set outer radius to inner radius plus padding.
- Use low-alpha borders or layered shadows appropriate to elevation; keep one light direction.
- Outline images with `rgba(0,0,0,.1)` in light mode or `rgba(255,255,255,.1)` in dark mode.
- Prefer pseudo-elements for decorative layers and shadow animation.
- Avoid depth, blur, or decoration that competes with content.

## Interaction

- Give pressable elements immediate feedback around `scale(.96-.98)` for 100-160ms.
- Gate hover behavior behind `(hover:hover) and (pointer:fine)`.
- Keep focus visible and keyboard actions instant.
- Prefetch by intent only when latency is meaningful; support focus and touch fallbacks.
- Every sound needs a visual equivalent and an off switch. Do not add sound to hover, typing, or routine navigation.

## Motion decision

Animate only to explain space, indicate state, confirm input, or soften a necessary state change.

- Remove motion from high-frequency and keyboard-driven actions.
- Keep user-triggered motion under 300ms: hover/press 120-180ms, small state changes 180-260ms.
- Use ease-out for entrances, ease-in for exits, ease-in-out for movement between visible states, and linear only for progress or time.
- Use springs for gestures, interruption, or intentional overshoot. Keep deformation within `.95-1.05` and bounce restrained.
- Prefer interruptible CSS transitions for rapid state changes; never use `transition: all`.
- Animate transform and opacity. Avoid layout and paint properties unless the technique explicitly requires them.
- Start scale entrances near `.95`, never `0`. Anchor popover transform origins to their trigger; keep modal origins centered.
- Keep stagger at 30-50ms per item and never delay interaction for it.
- Use one prominent animated focal point at a time and maintain a clear z-index hierarchy.
- Use `AnimatePresence` only with stable keys and meaningful exits. Remember `mode="wait"` serializes durations.
- Under reduced motion, remove spatial movement while preserving useful opacity or color feedback.

## Conflict rule

When the source skills disagree, choose the rule that is more accessible, less frequent, faster, and cheaper to render. Prefer no animation over ornamental animation. Validate visual judgment in the browser rather than treating numeric rules as substitutes for looking.

## Review output

For audits, report actionable findings as a compact table:

| Location | Before | After | Why |
| --- | --- | --- | --- |
| `file:line` | Current behavior or value | Concrete replacement | Perceptual or usability reason |

Order findings by impact. Omit compliant categories and avoid generic praise. For implementation tasks, summarize only material changes and verification.
