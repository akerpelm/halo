---
version: 1
slug: "src-app-tsx"
primary_target: "src/app.tsx"
related_targets: []
---

# Site home (apps/site)

Scope: the Halo showcase/docs/playground site, one long page. Mode: Persuade, with Read and Operate sections (docs, playground) below the opening.
Audience: React developers and the AI agents they direct. Action: install, then fire a real toast or open a real drawer within the first viewport.
User decision (2026-11-14): build BOTH Dichroic Gallery (default) and Frosted Partition, switchable live through a world toggle. The library ships both as `world` values.

## Direction contract

THESIS: The components are panes of coated glass hung in a bright gallery, and their motion shows up as moving light. The page refuses the dark neon dev-tool landing page, and it refuses the centered headline over a row of cards.
OWN-WORLD: Dichroic: a cool-white gallery wall (no cream), graphite ink, and a cyan/magenta/amber coating used only on pane edges and in the light the panes cast. Hairline steel suspension wires. Gallery wall-text typography (Funnel Display), museum object labels as the docs idiom (title, medium, dimensions = API, size, a11y). Partition: the same structure behind acid-etched glass, with aluminium mullions dividing the page into bays, no hue, silhouette shadows, and a clear disc that follows the cursor through the frost.
STORY: The visitor learns that Halo is a toast and a drawer on a real spring engine. They believe it because they can fling the hero pane and fire real toasts. They install, or copy a prompt for their agent.
FIRST VIEWPORT: Wall text headline at left, about 5.5rem. Right two-thirds: one large live pane hung from two wires at the top edge, which can be dragged, flung, and rubber-banded, and springs back with the release velocity while its cast light follows. Primary action "Fire a toast" plus an `npm i halo-ui-react` copy chip under the headline, and a world toggle in the nav.
FORM: Dichroic Gallery, candidate 4 of 7 on the ordered list (assigned); Frosted Partition, candidate 1 (pick), built as the alternate world on user request. seed:0388d356581a16eb
Signature interaction: the flingable hanging pane. Motion grammar: everything uses the library's own springs; nothing on the page uses a fixed-duration easing except hover/focus.
Raises: wuxia held moment (each section holds one spring at peak), azulejo whole-unit grid (8px detents), zine stepwise teaching (numbered mechanism steps where the sequence carries meaning), itasha seam-crossing (cast light crosses section boundaries).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
