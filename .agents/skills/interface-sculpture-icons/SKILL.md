---
name: interface-sculpture-icons
description: Design and implement premium miniature UI objects and experimental prototype-board widgets as React components using Tailwind CSS and Motion. Use for tactile controls, glass surfaces, skeuomorphic cards, compact dashboards, floating search, media controls, payment objects, agent requests, and animation-ready interface sculptures.
---

# Interface Sculpture Icons

Create miniature functional UI objects that feel tactile and physically coherent. Favor soft white boards, rounded forms, restrained glass, subtle shadows, precise controls, and elegant microinteractions. Preserve the host project's conventions, tokens, accessibility patterns, and architecture.

## Workflow

1. Inspect the design system, dependencies, and nearby components.
2. Clarify purpose, states, dimensions, and interactions.
3. Choose one physical metaphor: instrument, device, card, console, window, or control surface.
4. Establish silhouette and hierarchy before texture or motion.
5. Implement real behavior and semantic controls.
6. Add material, lighting, and depth in restrained layers.
7. Animate only state or physical response.
8. Test keyboard use, reduced motion, responsive behavior, and contrast.

Never replace functional controls with decorative mockups or fake activity.

## Composition

Treat each widget as a small product object. Give it a recognizable silhouette, one dominant surface, no more than two subordinate levels, and one focal point. Keep secondary controls quiet. Prefer asymmetry with balance and generous whitespace.

Use a 4px or 8px control rhythm, 12–24px object padding, and 12–20px display-to-control spacing. Use scale, contrast, depth, and placement before color. Keep typography compact and use tabular numerals for telemetry.

## Materials and motion

Build depth from quiet cues: a near-white gradient, neutral low-opacity edge, small inset highlight, and restrained ambient shadows. Keep glass sparse. Prefer interruptible transform and opacity, keep feedback under 300ms, avoid bounce by default, and honor reduced motion.

## Final checklist

- The silhouette reads at thumbnail size.
- There is one focal point and no fake controls.
- Material layers fit the host page.
- Motion communicates state and remains interruptible.
- Controls are semantic, accessible, and operable.
- Reduced-motion and responsive behavior are verified.
