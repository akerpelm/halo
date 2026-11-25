# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

pnpm monorepo. Library: React + TypeScript, built with tsup, zero runtime dependencies beyond React. Site (docs, showcase, playground): Vite + React + Tailwind v4. Confirmed by the user.

## What it is

Halo (`halo-ui-react`) is an opinionated, physically-animated component library for a small set of well-defined primitives: a **Toast** (a Sonner alternative), a **Drawer** (a Vaul alternative), a **Popover** (on the native popover API and CSS anchor positioning) and **Swipe actions** (list rows that slide to uncover real buttons). All four share one spring engine and one frosted-glass material. The set grows only where the springs and the material make a component meaningfully better than the platform or the usual library.

## Users and job

- **Primary:** React developers who want a toast, drawer, popover or swipeable list that feels native-grade out of the box, and who increasingly install components through AI agents.
- **Secondary:** AI coding agents acting on a developer's behalf. Halo ships machine-readable usage (llms.txt, per-component prompts, shadcn-style registry JSON) so an agent can install and customize correctly.
- **Job:** drop in an accessible component, pick a design direction, tune the motion, paste the config or prompt, done.

## Mechanism / position

- Gesture-to-spring handoff: release velocity comes from the last ~80ms of pointer samples and feeds an analytic damped-spring solver, so animations are interruptible and continue the user's momentum. Sonner and Vaul use averaged velocity and fixed-duration CSS curves.
- Projected-endpoint snapping for drawer detents rather than threshold heuristics.
- Transform/opacity only. No height animation (Sonner animates height).
- Native `<dialog>` top layer for the drawer. No Radix dependency (Vaul depends on Radix and is unmaintained).
- The popover is the native `popover` attribute placed by CSS anchor positioning, with no positioning library; the browser owns Esc, outside clicks and focus return.
- Swipe actions are real buttons: a full swipe clicks the same button a keyboard user reaches with Tab, so every path runs one handler.
- Accessibility is the base layer, not an add-on: live-region politeness by severity, keyboard dismissal, focus management, reduced-motion and reduced-transparency support.

## Surfaces

1. The library package (API, defaults, the CSS material).
2. The site: showcase, per-component docs, design directions, playground, AI integration.

## Brand commitments (from the user)

- Frosted glass, modern, 2026, simple, minimal, clean, abstract.
- Must look nothing like Anthropic or Claude UI.
- Original: not a reskin of Sonner or Vaul.

## Open decisions

- Published on npm as `halo-ui-react`. The `halo-ui` and `haloui` scopes were taken, and npm blocks `haloui` as too similar to the existing `halo-ui` package.
- License: MIT.
