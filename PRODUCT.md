# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

pnpm monorepo. Library: React + TypeScript, built with tsup, zero runtime dependencies beyond React. Site (docs, showcase, playground): Vite + React + Tailwind v4. Confirmed by the user.

## What it is

Halo (`@halo-ui/react`) is an opinionated, physically-animated component library for two well-defined primitives: a **Toast** (a Sonner alternative) and a **Drawer** (a Vaul alternative). Both share one spring engine and one frosted-glass material.

## Users and job

- **Primary:** React developers who want a toast or drawer that feels native-grade out of the box, and who increasingly install components through AI agents.
- **Secondary:** AI coding agents acting on a developer's behalf. Halo ships machine-readable usage (llms.txt, per-component prompts, shadcn-style registry JSON) so an agent can install and customize correctly.
- **Job:** drop in an accessible toast or drawer, pick a design direction, tune the motion, paste the config or prompt, done.

## Mechanism / position

- Gesture-to-spring handoff: release velocity comes from the last ~80ms of pointer samples and feeds an analytic damped-spring solver, so animations are interruptible and continue the user's momentum. Sonner and Vaul use averaged velocity and fixed-duration CSS curves.
- Projected-endpoint snapping for drawer detents rather than threshold heuristics.
- Transform/opacity only. No height animation (Sonner animates height).
- Native `<dialog>` top layer for the drawer. No Radix dependency (Vaul depends on Radix and is unmaintained).
- Accessibility is the base layer, not an add-on: live-region politeness by severity, keyboard dismissal, focus management, reduced-motion and reduced-transparency support.

## Surfaces

1. The library package (API, defaults, the CSS material).
2. The site: showcase, per-component docs, design directions, playground, AI integration.

## Brand commitments (from the user)

- Frosted glass, modern, 2026, simple, minimal, clean, abstract.
- Must look nothing like Anthropic or Claude UI.
- Original: not a reskin of Sonner or Vaul.

## Open decisions

- Publishing scope `@halo-ui` was free on npm as of 2026-11-14; not reserved yet.
- License: not decided (MIT assumed for the scaffold, user to confirm).
