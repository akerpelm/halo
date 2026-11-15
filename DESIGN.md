---
name: Halo
description: A toast and a drawer for React on one spring engine, hung as coated glass in a bright gallery.
colors:
  gallery-wall: "oklch(96.4% 0.005 250)"
  gallery-wall-deep: "oklch(92.6% 0.007 250)"
  graphite-ink: "oklch(19% 0.02 262)"
  graphite-ink-soft: "oklch(40% 0.018 262)"
  graphite-ink-faint: "oklch(52% 0.014 262)"
  hairline: "oklch(84% 0.008 255)"
  steel-wire: "oklch(62% 0.01 255)"
  coat-cyan: "oklch(80% 0.14 198)"
  coat-magenta: "oklch(69% 0.22 332)"
  coat-amber: "oklch(85% 0.14 78)"
  night-wall: "oklch(15.5% 0.012 262)"
  night-wall-deep: "oklch(12% 0.012 262)"
  night-ink: "oklch(96% 0.006 262)"
  night-hairline: "oklch(30% 0.014 262)"
  etched-wall: "oklch(93.2% 0.003 250)"
  etched-wall-deep: "oklch(89% 0.004 250)"
  aluminium-mullion: "oklch(74% 0.006 250)"
  etched-wall-dark: "oklch(17% 0.004 250)"
  aluminium-mullion-dark: "oklch(36% 0.006 250)"
  pane-surface: "oklch(99% 0.004 240 / 0.6)"
  pane-surface-dark: "oklch(26% 0.018 262 / 0.52)"
  pane-surface-etched: "oklch(97.5% 0.002 250 / 0.8)"
  status-success: "oklch(52% 0.13 165)"
  status-error: "oklch(54% 0.2 20)"
  status-warning: "oklch(60% 0.14 70)"
  status-info: "oklch(52% 0.16 255)"
typography:
  display:
    fontFamily: "Funnel Display Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7.6vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Funnel Display Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4.4vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Funnel Display Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  lede:
    fontFamily: "Funnel Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Funnel Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Funnel Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: "JetBrains Mono Variable, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.7
    fontFeature: "liga 0, calt 0"
rounded:
  focus: "6px"
  field: "12px"
  well: "16px"
  pane: "18px"
  panel: "24px"
  sheet: "28px"
  pill: "999px"
spacing:
  gutter-sm: "16px"
  gutter: "32px"
  column-gap: "48px"
  section: "96px"
  section-lg: "128px"
  container: "1240px"
  nav-height: "64px"
components:
  button-primary:
    backgroundColor: "{colors.graphite-ink}"
    textColor: "{colors.gallery-wall}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-quiet:
    backgroundColor: "oklch(19% 0.02 262 / 0.06)"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "40px"
  button-quiet-hover:
    backgroundColor: "oklch(19% 0.02 262 / 0.11)"
  button-outline:
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "40px"
  install-chip:
    textColor: "{colors.graphite-ink}"
    typography: "{typography.code}"
    rounded: "{rounded.pill}"
    padding: "0 6px 0 20px"
    height: "48px"
  segmented-option-selected:
    backgroundColor: "{colors.gallery-wall}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  code-block:
    backgroundColor: "{colors.gallery-wall-deep}"
    textColor: "{colors.graphite-ink}"
    typography: "{typography.code}"
    rounded: "{rounded.well}"
    padding: "4px 16px 16px"
  toast-pane:
    backgroundColor: "{colors.pane-surface}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.pane}"
    padding: "14px 14px 14px 16px"
    width: "368px"
  drawer-sheet:
    backgroundColor: "{colors.pane-surface}"
    rounded: "{rounded.sheet}"
    width: "640px"
---

# Design System: Halo

## Overview

**Creative North Star: "The Dichroic Gallery"**

Halo's components are panes of coated glass hung in a bright gallery, and their motion shows up as moving light. The room is a cool-white wall with graphite ink and hairline steel wires; the only colour in it is the cyan, magenta, and amber coating on a pane's edge and the soft pools of light that pane throws on the wall. Docs read like wall text and museum object labels: a large display headline, a quiet lede, and a small label that lists title, date, medium, and dimensions, where the dimensions are the API.

The system runs as worlds sharing one structure, switched live through `data-world` on the root. The site's identity is built on two: **Dichroic** (default) and **Partition**, the same room behind acid-etched glass with aluminium mullions framing the content column, no hue, and silhouette shadows instead of coloured light. The library ships four more material token sets the site can wear: **Smoked** (bronze-tinted, always dark), **Vapor** (most diffuse, near-invisible edge), **Crystal** (clear, bevelled, prismatic pale edge, little blur), and **Ink** (solid, no blur). These only retint the panes and the cast light; the wall stays the gallery's. Each world has a light and a dark theme through `data-theme`. Page structure, type, spacing, and components never change between worlds; only tokens do.

Density is gallery-sparse: one idea per section, generous section padding, a left column of wall text and a right column of working material. Everything that moves is driven by the library's own spring solver, so the site is itself the demo. The page refuses the dark neon dev-tool landing page and the centred headline over a row of cards, and it must look nothing like Anthropic or Claude UI.

**Key Characteristics:**
- Cool-white gallery wall (never cream) with graphite ink; ink, not a hue, is the accent.
- Coat colours exist only on pane edges and in the light the panes cast.
- One material, `.halo-surface`: frosted pane, padding-box edge ring, layered shadow.
- Two runtime worlds (Dichroic, Partition) times two themes, all from tokens on one DOM.
- Motion from the spring solver only; CSS transitions borrow a curve sampled from it.
- Pills for every control, hairlines for every division, no card grids.

## Colors

A near-monochrome gallery of cool greys and graphite, lit by a three-hue dichroic coating that never touches text or controls.

### Primary
- **Graphite Ink** (graphite-ink): The accent. Primary button fill, selected states, toggle track when on, focus outline, range accent colour, body text. In dark themes it inverts to Night Ink.

### Secondary
- **Coat Cyan**, **Coat Magenta**, **Coat Amber** (coat-cyan, coat-magenta, coat-amber): The dichroic coating. Swept as a conic gradient around a pane's edge ring, its start angle driven per frame by `--halo-shift` from the pane's motion, and blurred into light pools (48px blur, opacity `--pool`: 0.42 light, 0.32 dark) that fall on the wall beneath the pane. Pools blend with `multiply` on light walls and `screen` on dark walls so they tint letters without washing them out. Cyan also tints `::selection` at 45%; magenta is the caret colour. The library carries its own near-identical coat set on the pane (`--halo-coat-a/b/c`) so a pane outside the site still glows.

### Neutral
- **Gallery Wall** (gallery-wall): Page background, the text colour on primary buttons, the selected segment's fill.
- **Gallery Wall Deep** (gallery-wall-deep): `html` background, code wells (at 70%), material sample strips.
- **Graphite Ink Soft** (graphite-ink-soft): Ledes, nav links, secondary copy, control labels.
- **Graphite Ink Faint** (graphite-ink-faint): Label terms, captions, the `$` prompt, footer copy.
- **Hairline** (hairline): Every division: section top borders, table rules, inset 1px rings on outline buttons, chips, code wells, and the playground panel.
- **Steel Wire** (steel-wire): The suspension wires, the logo's hangers, the scrollbar thumb.
- **Night Wall / Night Ink / Night Hairline**: Dichroic dark. The wall drops to a blue-black (night-wall, night-wall-deep), ink rises to near white, coats dim about 5 points of lightness.
- **Etched Wall / Aluminium Mullion** (etched-wall, aluminium-mullion, and their `-dark` pair): Partition. Chroma falls to ~0.004, and the three coat tokens are re-pointed to neutral greys (or near-black in Partition dark) so every cast becomes a silhouette shadow.
- **Pane Surface** (pane-surface, pane-surface-dark, pane-surface-etched): The translucent fill behind the pane's backdrop blur. A solid fallback (`--halo-surface-solid`) replaces it under reduced transparency, higher contrast, or no `backdrop-filter` support.
- **Status** (status-success, status-error, status-warning, status-info): Toast icon colour only, each with a lighter `light-dark()` partner. Never used for fills.

### Named Rules
**The Edge-and-Light Rule.** Coat hues live on a pane's edge ring and in the light it casts, plus the text selection tint and caret. They never fill a button, colour text, or tint a surface.

**The Ink Accent Rule.** The strongest emphasis on any screen is graphite ink on wall (or its inverse in dark). There is no brand hue to reach for.

**The Silent Partition Rule.** In Partition every coat token resolves to a neutral grey; the only chroma left on the page is the status icon colour.

## Typography

**Display Font:** Funnel Display Variable (with ui-sans-serif, system-ui)
**Body Font:** Funnel Sans Variable (with ui-sans-serif, system-ui)
**Label/Mono Font:** JetBrains Mono Variable (with ui-monospace), ligatures off

All three are self-hosted through `@fontsource-variable` packages imported in the site entry; no font CDN.

**Character:** Gallery wall text. Funnel Display is set large, semibold, and tightly tracked for headings and object-label titles; Funnel Sans carries everything you read at length. Mono is reserved for code, the install command, and live numeric readouts.

### Scale

UI text uses seven Tailwind tokens defined in `apps/site/src/styles.css` `@theme`. Ad-hoc pixel sizes are not used:
`text-caption` 12px · `text-label` 13px · `text-ui` 14px · `text-body` 15px · `text-lead` 17px · `text-title` 20px · `text-heading` 24px.
Display and section headlines stay fluid `clamp()` sizes (below). The only fixed size off the scale is the decorative 120px glyph behind the material samples.

### Hierarchy
- **Display** (600, clamp(3rem, 7.6vw, 6rem), 0.94, -0.035em): The hero wall text only, capped at 15ch.
- **Headline** (600, clamp(2.25rem, 4.4vw, 3.5rem), 1, -0.03em): One per section, top of the left column.
- **Title** (600, 17 to 20px, -0.015em, display face): Object-label titles (17px), direction rows (19px), mechanism steps (20px), the pane's own message (clamp(1.2rem, 2.4vw, 1.75rem)).
- **Lede** (400, 17px, 1.55): Section introductions under the headline, max 40ch; the hero lede is clamp(17px, 1.5vw, 19px) at 44ch.
- **Body** (400, 15 to 16px, 1.5 to 1.55): Running copy, table cells (14px), direction descriptions (15px). `text-wrap: pretty` on paragraphs, `balance` on headings.
- **Label** (400 to 500, 12 to 14px): Control labels and nav (13 to 14px), button text (13/14/15px by size), captions (13px faint). Sentence case throughout.
- **Code** (400, 13px, 1.7): Code wells; readouts at 12px with tabular numerals.

### Named Rules
**The Wall Text Rule.** Headings use the display face at weight 600 with negative tracking that grows with size (-0.015em at title, -0.03em at headline, -0.035em at display). Body copy is never set in the display face.

**The Object Label Rule.** Component specs are written as a museum label: title and date, italic medium, then a two-column list of dimensions (import, weight, peers, motion, accessibility) in 13px with faint terms and ink values.

## Layout

A 1240px container (`max-w-[1240px]`) with 16px gutters on phones and 32px from 640px. Every section opens with a hairline top border, then 96px of top and bottom padding (128px top from 1024px). From 1024px a section is a 12-column grid with 48px column gaps: wall text in columns 1 to 4 (headline, lede, object label), working material in columns 5 to 12. Below 1024px the columns stack.

The hero breaks the grid on purpose. It pulls up under the sticky 64px nav, sets the display headline bottom-left in a viewport-tall stage (max 980px), and hangs the live pane over the right portion from two wires anchored to the top edge, so the frosted glass passes over real letters. Below 1024px the pane hangs beneath the copy in its own 440px stage.

Rhythm inside sections: 48px between major blocks, 64px before comparison tables, 8 to 16px gaps between controls. Lists of options are hairline-ruled rows, not cards.

Partition adds **mullions**: two 1px aluminium lines down the page, set in the gutters at 8px (phones), 16px (640px up), and tracking the container edge at calc(50% - 632px) from 1304px. Section borders become the transoms between bays. Mullions never cross text.

Breakpoints in use: 600px (toasts go full width), 640px, 768px (nav links appear), 1024px (12 columns, hero pane joins the headline), 1304px (mullions follow the container).

## Elevation & Depth

The page is flat; depth belongs to the glass. Wall surfaces separate by tone (wall versus wall-deep) and by 1px inset hairline rings, never by shadow. Only the `.halo-surface` pane carries a shadow stack, and that stack is part of the material: an inner top highlight, a contact shadow, a long soft drop, and in Dichroic two coloured offsets (cyan to the left, magenta to the right) that read as light leaking through the coating. Partition swaps those for a neutral silhouette shadow. Backdrop blur is 22px with 1.7 saturation in Dichroic and 30px with 1.05 saturation in Partition. The sticky nav uses the same idea at low strength (72% wall with heavy backdrop blur).

### Shadow Vocabulary
- **Dichroic pane** (`--halo-shadow` in `.halo`): inset top highlight, 1px contact, 16px/36px drop, plus coat-a and coat-b offset glows. Toasts, drawers, the hanging pane, material samples.
- **Partition pane** (`--halo-shadow` under `[data-halo-world='partition']`): inset highlight, 1px contact, 22px/44px neutral drop. Same elements in Partition.
- **Thumb lift** (`0 1px 2px oklch(0% 0 0 / 0.12)` to `/ 0.25`): The selected segment and the toggle thumb, the only lifted controls on the wall.

### Named Rules
**The Glass-Only Shadow Rule.** If it is not a pane, it does not cast a shadow. Wall-level containers use an inset hairline ring (`inset 0 0 0 1px var(--line)`) instead.

**The Cast Light Rule.** Cast light is pure geometry: blurred ellipses moved by transform on a softer spring that trails the pane, blended with multiply (light) or screen (dark). It is never baked into an image.

## Shapes

Two families. Controls are full pills (999px): buttons, chips, the install command, segmented controls, toggles, copy buttons, toast actions and close buttons. Containers are generously rounded rectangles: code wells 16px, the playground panel 24px, selects 12px, toast panes 18px, drawers and the hero pane 28px with the edge against the screen squared off. Focus outlines take a 6px radius.

The pane's edge ring is a pseudo-element with a transparent border (`--halo-edge-width`, 1px), the edge gradient painted to the border box, and a mask that excludes the **padding box** from the border box. The padding box follows the inner radius, so the ring stays one even width through the corners.

### Named Rules
**The Padding-Box Ring Rule.** The edge ring is masked padding-box against border-box, never content-box. A content-box mask leaves the ring thick and lumpy in the corners whenever the pane has padding; that bug shipped once and was caught by eye.

**The Pill Control Rule.** Anything you press is a pill. Anything that holds content is a rounded rectangle. Nothing on the wall has square corners except table rules and section borders.

## Components

Character: quiet controls on the wall, physical glass for the components themselves.

### Buttons
- **Shape:** Full pill (999px).
- **Primary:** Graphite ink fill with wall-coloured text; 48px tall with 24px padding at `lg`, the hero's "Fire a toast". One per view.
- **Quiet (default):** Ink at 6% (9% in dark) behind ink text; 40px tall with 18px padding. Used for demo triggers and most actions.
- **Outline:** Transparent with an inset 1px hairline ring.
- **Sizes:** sm 32px / 13px text, md 40px / 14px, lg 48px / 15px; weight 500.
- **Hover / Focus / Active:** Primary drops to 88% opacity, quiet deepens to 11%; 150ms colour and opacity transitions; press scales to 0.97; focus is the global 2px ink outline at 3px offset. Disabled is 45% opacity.

### Chips
- **Install chip:** A 48px pill with an inset hairline ring, the mono command with a faint `$` prompt, and a nested quiet copy button. Sits beside the primary action in the hero.
- **Copy button:** 28px pill, 12px medium soft-ink text with a 13px stroke icon; hover gains a 7% ink wash. Announces "Copied" through a polite live region for 1.6s.

### Cards / Containers
- **Code well:** 16px radius, wall-deep at 70%, inset hairline ring; a caption row with the filename in 12px faint mono and a copy button; 13px code at 1.7 line height.
- **Playground panel:** 24px radius, inset hairline ring, settings column (300px) divided from output by a hairline.
- **Material sample:** 176px wall-deep strip with "Halo" set in 120px display at 25% ink behind a live pane, so the frost has letters to blur.
- No card grids. Option lists are hairline-ruled rows (title, one line, actions).

### Inputs / Fields
- **Segmented control:** A radio group in a pill track (ink at 6%), 13px options; the selected option is a wall-coloured pill with a thumb-lift shadow. Arrow keys move natively; focus shows as a 2px ink outline on the option. Used for the world switch in the nav.
- **Toggle:** 40 by 24px switch, `role="switch"`; track ink at 12%, ink when on; a 20px wall-coloured thumb that slides on `--ease-spring` over 620ms.
- **Slider:** Native range input with ink accent; label at left, mono tabular value at right.
- **Select:** 40px, 12px radius, ink at 6% fill, no border.

### Navigation
Sticky 64px bar on 72% wall with backdrop blur. Left: the mark (a rounded pane hung from two wire strokes) and the lowercase "halo" wordmark in 19px display semibold. Centre-left: section links as 14px soft-ink text that darkens to ink on hover, hidden below 768px. Right: the world segmented control and a 36px round theme button with a stroked sun or moon. A skip link slides in on focus.

### Halo Pane (signature)
The `.halo-surface` material that toasts, drawers, the hero pane, and samples all share: translucent pane fill, backdrop blur and saturation, the shadow stack, and the coated edge ring whose conic gradient rotates with `--halo-shift` as the pane moves. In Partition the ring becomes one even aluminium hairline and the pane is etched: frosted everywhere except an 84px clear disc that follows the pointer. Toast panes are 368px wide with 14/16px padding, 14px text, a 580-weight title, and a muted description at 0.93em. Drawer sheets are 28px radius, max 640px wide from top or bottom (420px from the sides), with a 40 by 5px grabber inside a 120 by 32px real button.

### Hanging Pane (signature)
The hero's live pane, hung from two 1px steel wires drawn from fixed ceiling anchors to the pane's rotated top corners. Drag it and it rubber-bands; release it and the release velocity feeds the same spring the toast and drawer use, while three light pools trail it on a softer spring. Arrow keys nudge it. On load it holds at the top of its swing for 700ms, then is released. A mono readout reports the last release speed in px/s.

### Time-left Indicator

Set by the Toaster's `timer` prop and drawn as a countdown ring that empties anticlockwise from twelve o'clock (SVG `stroke-dashoffset` with `pathLength=1`, 1.6px stroke, a track at 13% foreground). It freezes while the stack is hovered, focused, or touched.
- `icon` (default): the ring replaces the status icon's own outline, in the type's colour, so the badge itself is the timer. Glyphs without a circle (the error triangle, custom icons) sit inside the ring at 15px. Toasts with no icon fall back to `close`.
- `close`: the ring surrounds the × and is always visible on timed toasts.
- `edge`: the edge ring dims toward the pane colour as time passes. It is quiet, but the least obviously a timer.
- `false`: no indicator.
Never draw time left as a separate bar or line along the pane. Users read it as a second border.

### Motion
All movement in response to gesture or state runs on the library's analytic spring solver (`resolveSpring`, `createSpringValue`), carrying the user's release velocity. CSS-only animations use `--ease-spring` (site) or `--halo-spring-ease` (library), the same `linear()` curve sampled from that solver, typically over 620ms. Fixed-duration `ease` transitions are reserved for hover, focus, and colour changes (140 to 300ms). Transform and opacity only; nothing animates height. Under reduced motion springs settle instantly, the icon pop is removed, and smooth scrolling is off.

## Do's and Don'ts

### Do:
- **Do** keep coat colour on pane edges and cast light only; reach for graphite ink when something needs emphasis.
- **Do** build every new glass element from `.halo .halo-surface` so it inherits the blur, shadow, edge ring, and both worlds for free.
- **Do** mask edge rings padding-box against border-box so the ring is one even width through the corners.
- **Do** drive new motion from the spring solver, and use `--ease-spring` when it has to be CSS-only.
- **Do** express world and theme differences as token overrides under `[data-world]` and `[data-theme]`, never as separate markup.
- **Do** separate wall-level containers with tone and 1px inset hairline rings, not shadows.
- **Do** write specs as object labels (title, medium, dimensions) and lists of options as hairline-ruled rows.
- **Do** show time left as a countdown ring, the status icon by default. **Don't** add a bar or line inside or along the pane: users read it as a second border.
- **Do** provide the solid surface fallback for reduced transparency, higher contrast, and missing `backdrop-filter`.

### Don't:
- **Don't** use cream or warm off-white walls; the gallery is cool white (hue 250).
- **Don't** colour buttons, text, or backgrounds with the coat hues.
- **Don't** mask the edge ring against the content box.
- **Don't** add shadows to wall-level cards, wells, or panels.
- **Don't** animate height, width, or layout properties; transform and opacity only.
- **Don't** use fixed-duration easing for anything that moves in response to a gesture.
- **Don't** lay out a centred headline over a row of cards, or a dark neon dev-tool hero.
- **Don't** introduce hue into Partition beyond status icons.
- **Don't** borrow Anthropic or Claude UI styling.


## Density and radius

`density` (`compact` | `comfortable` | `spacious`) moves padding, inner gap, and type size together through `--halo-pad-y`, `--halo-pad-x`, `--halo-pad-end`, `--halo-inner-gap`, and `--halo-font-size`. Comfortable is 14/16/14px padding, a 12px gap, and 14px type. Compact is 9/12/10, 9, and 13. Spacious is 18/20/18, 14, and 15.

`radius` is a preset (`square` 6, `soft` 12, `round` 18, `pill` 999) or px, written to `--halo-radius`. Drawers write `--halo-drawer-radius` instead, capped at 40px, with a default of 28. The edge ring and the time-left arc inherit the radius, so they stay concentric at every setting.


## Borrowed motion (owned)

Three site-only pieces started from React Bits. They were installed with the shadcn CLI and then rewritten as house code on Halo's spring engine, so every animation still comes from one solver and `motion` is not a dependency:
- `Magnet` (components/magnet.tsx): the hero actions lean up to 10px toward the cursor and settle with bounce 0.4. Only the nearest magnet pulls.
- `Spotlight` (components/spotlight.tsx): a gallery spot trails the pointer across each world sample (overlay blend in light themes, screen in dark) and turns the pane's `--halo-shift`.
- `CountUp` (components/count-up.tsx): measurements spring to their value when they enter view and glide between values. Screen readers get the final value immediately.


## Entrances and exits

The Toaster's `motion` prop picks how toasts arrive and leave. Every style is one reveal spring from 0 to 1, layered over the stack springs, and each exit plays its entrance in reverse on a no-bounce spring.
- `rise` (default): lifts 28px in from the anchored edge, scaling from 0.96.
- `fade`: opacity only. This is also what reduced-motion users always get.
- `drop`: falls 72px from the far side and lands on the spring.
- `hinge`: swings down from the top edge (rotateX from −78°, perspective 700px).
- `focus`: pulls into focus from a 12px blur and a 1.07 scale.
- `bloom`: grows out of a centred capsule with a clip-path inset.

## Playground as builder

The playground starts from PLAIN: Ink, fade, smooth spring, no icons, timer, or close button, and soft corners. Each choice is shown as a removable layer chip. Every change previews out, then in. Directions load into it as presets.


## Extending: custom worlds

A world is a single `[data-halo-world='name']` selector of custom properties. The library reads `--halo-world-edge` for the edge ring, and only Dichroic and Crystal (whose edges follow `--halo-shift`) declare their edge on the pane. The site proves this with **Midnight**, defined only in `apps/site/src/styles.css` inside `@layer components`, which you can pick in the builder and fire from "Make it yours". Per-part styling uses the Toaster's `classNames`, and the stylesheet is imported into a cascade layer so Tailwind utilities win.

## Push-back

The recess zooms the page out around the centre of the viewport (`transform-origin` set to the current scroll position), drifting 14px away from the drawer's edge at full progress. Depth defaults to 6% and bounce to 0.42, on a 0.46s spring.


## Intent

`intent` shows a toast's type in colour, for when icons are off or not enough: `tint` washes the glass (a 15% oklab mix; oklch drifts pink through a white surface's 0° hue), `edge` recolours the edge ring at its usual width, and `glow` adds a cast shadow in the type colour. Default and loading toasts are never coloured. A thick coloured side-stripe is deliberately not offered.

## Hidden toasts

Toasts past `visibleToasts` are `inert` with `pointer-events: none`, so an invisible toast can never block the page or take focus.


## Accessibility floor (audited)

axe-core (WCAG 2.2 AA plus best practices) passes in light and dark, with toasts and an open drawer.
- Faint text measures at least 4.5:1 on both walls.
- Code blocks are focusable so long lines can be scrolled by keyboard.
- Every toaster has a distinct landmark name, and only the unnamed one takes the Alt+T shortcut.
- Every target is at least 24px. On coarse pointers, site controls grow to 44px, and toast actions and close buttons get a 44px hit area through an invisible `::after` that doesn't change the look.
- There is no horizontal overflow from 320px up.


## Toast types only Halo ships

- `from`: the toast launches out of its trigger (measured once per toast, before any transform) and lands in the stack on the stack springs.
- `toast.stream`: text arrives under a spinner with a 2px caret, announced once when it finishes.
- `toast.undo`: the countdown ring sits on the Undo button, so the timer is the undo window.
- `group`: repeats update one toast and pop a pill counter (screen readers hear "3 times").

## Worlds: Opal, Mercury, Vellum

- **Opal** puts its iridescence on the surface itself, as a gradient keyed to `--halo-shift`.
- **Mercury** uses a 2px chrome edge whose bright band slides with motion.
- **Vellum** is matte drafting film (3px blur, a 6px radius) with a printed rule drawn as stacked inset shadows 4–5px in.

## Showcase structure after the critique (29/40)

- Phones get a scrolling row of section chips under the header.
- The builder previews inside its own stage via a `contained` Toaster, shows four options per group with "N more", and folds Shape, Details, and Stack.
- "World" is the one name for materials.
- The wall labels hang on the same rigging as the hero and can be flung.
- The page closes on a display-size line: "Every animation on this page runs on its own springs."
