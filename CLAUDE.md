# Halo

Spring-physics Toast, Drawer, Popover and Swipe actions for React, with a frosted-glass material and nine visual worlds.

- Site: https://haloui.dev (docs, playground, showcase)
- npm: `halo-ui-react` (0.1.0, MIT)
- Repo: https://github.com/akerpelm/halo (public)

Read `DESIGN.md` before any visual change and `PRODUCT.md` for the brief. This file wins over any general conventions on conflict.

## Layout

```
packages/react   halo-ui-react, the library (tsup, no runtime dependencies besides React 18.2+)
  src/spring/      closed-form spring solver, spring values, one shared frame loop
  src/gesture/     velocity tracking (last 80 ms), rubber-banding, flick projection
  src/utils/       appearance tokens, media queries, scroll lock, controllable state
  src/drawer/      root/ trigger/ content/ handle/ title/ description/ close/ scroll/ + index.parts.ts
  src/toast/       store/ toaster/ toast-item/ icons/
  src/popover/     root/ trigger/ popup/ (placement, motion) title/ description/ close/ + index.parts.ts
  src/swipe/       group/ (layout, focus) root/ (geometry, motion) content/ (drag) actions/ action/ + index.parts.ts
  src/styles.css   the material and all worlds as CSS custom properties
  test/            vitest + jsdom
apps/site        haloui.dev (Vite, React 19, Tailwind v4)
  src/sections/    home and playground
  src/docs/        docs pages, search, prop tables, the mobile docs menu
  src/components/  hanging-pane (the signature), drawer-stage, nav, and the rest
  src/lib/         router, settings (world and theme), build config, cable simulation
  src/routes.ts    the route manifest: every path, title, description and OG image. Nav order, prerender, sitemap and llms.txt read it
  src/prerender/   head tags, sitemap, llms.txt, _headers and _redirects, and the HTML-to-Markdown converter
  src/content/     llms.md, the template for /llms.txt
wrangler.jsonc   Cloudflare deploy config (static assets, 404.html for unknown paths)
```

Entry points: `halo-ui-react`, `halo-ui-react/toast`, `halo-ui-react/drawer`, `halo-ui-react/popover`, `halo-ui-react/swipe`, `halo-ui-react/spring`, `halo-ui-react/styles.css`. The public API is `toast()`, `<Toaster>`, the `Drawer`, `Popover` and `Swipe` namespaces (plus named exports for popover and swipe parts), `useDrawer`, and the spring helpers. Do not change it without a version bump and a docs update.

## Commands

```sh
pnpm install
pnpm dev         # builds the library, then runs the site with library source aliased in
pnpm test        # 78 library tests (vitest)
pnpm typecheck
pnpm build
pnpm --filter haloui-site test:e2e   # 84 Playwright checks against a prerendered preview build
pnpm --filter halo-ui-react size     # after a library build: rewrite sizes.json and the size tables in both READMEs
pnpm --filter haloui-site og         # regenerate public/og/*.png after changing a route title
```

pnpm 10, Node 22 (`.node-version`; the publish workflow uses Node 24 because trusted publishing needs npm 11.5+). Run builds one after another: a stale `tsup --watch` from an earlier `pnpm dev` can empty `dist` mid-build. Restart `pnpm dev` after changing `tsup.config.ts`.

## Rules

- Never type a bundle size, the version or the React peer range by hand. Read them from `packages/react/sizes.json` and `package.json` (`apps/site/src/lib/package-facts.ts`). CI fails when `sizes.json` is stale.

- No comments in code. The only exception is JSDoc on the library's public API.
- TypeScript strict. `type` over `interface`, named exports, one component per file, kebab-case file names. No `any`, no non-null `!`.
- Library structure follows Base UI: a folder per part, `index.parts.ts` naming the parts, and a named hook beside a component for any behaviour that would crowd it (`use-drawer-drag.ts`, `use-toast-swipe.ts`).
- Tailwind v4 with tokens in `@theme`; no raw hex in components. `cn()` for conditional classes.
- Animate transform and opacity only. Every animation honours `prefers-reduced-motion`.
- Accessibility is required: WCAG AA contrast, a visible `:focus-visible` ring on everything interactive, 44px targets on coarse pointers, semantic HTML first.
- Smallest change that solves the problem. Plan multi-file changes in a few bullets before building.
- Small commits, imperative subject (`add`, `fix`, `remove`). Ask before pushing, force-pushing, or publishing to npm. A push to `main` deploys the site at the same time CI starts, so a failing check does not stop the deploy: run the checks yourself before pushing.
- No absolute claims in copy ("fully accessible", "no other library", "drop-in"). State the behaviour and link the proof.

## Verifying a change

Typecheck, test and build before every commit. CI runs those plus the Playwright checks (`apps/site/e2e`) on every pull request and every push to `main`. The Playwright suite covers axe, overflow, the keyboard walk, page transitions and reduced motion in Chromium; for anything visual, still open the page in a browser and check:

- widths 320, 375, 640, 768, 1024, 1440: no horizontal overflow, nothing clipped;
- light and dark, in Dichroic and at least one other world (Ink and Midnight catch the most bugs);
- axe with zero violations on `/`, `/playground`, and a docs page;
- a keyboard walk where every stop shows a focus ring;
- page transitions between Home, Docs and Playground, and between docs pages, with nothing flickering;
- reduced motion.

Bring a library change's behaviour under test: break the code on purpose and confirm a test fails.

## Deploying and releasing

- Site: automatic. Cloudflare Workers Builds deploys every push to `main` (`pnpm run build`, then `npx wrangler deploy`) and reports a check on the GitHub commit.
- Library: move the `## Unreleased` notes in `packages/react/CHANGELOG.md` under `## x.y.z (date)`, bump `version` in `packages/react/package.json`, commit, then push a `vx.y.z` tag. `.github/workflows/publish.yml` checks the tag, changelog and sizes, builds, tests, publishes with npm trusted publishing (provenance included, no token), and creates the GitHub Release from the changelog. The owner pushes release tags; agents prepare the commit.

## Gotchas

- The site is prerendered (`vite build --ssr` + `scripts/prerender.mjs`) and hydrated. Never read `window`, `document`, `localStorage`, `navigator` or `matchMedia` at module level or during render: use `useSyncExternalStore` with a server snapshot, or an effect. A hydration mismatch shows up as React error #418 and fails `e2e/seo.spec.ts`.
- During hydration, settings and media queries return their server values (Dichroic, light, motion allowed), then update. Effects that run once on mount must read the live value (see the swing-in in `hanging-pane.tsx`). `html[data-booting]` hides panes until the saved world and theme have rendered.
- A new page needs an entry in `src/routes.ts`. Docs pages also need a `docPages` entry with the same slug.

- A `view-transition-name` makes its element a backdrop root, so frosted glass inside stops blurring the page. Persistent chrome is named only during transitions: `html:active-view-transition [style*='--vt-name']` in `apps/site/src/styles.css`.
- Never define a world's `--halo-surface-solid` as `var(--halo-surface)`. Overrides built from it become a cycle and the pane turns transparent.
- Measure layout in `useLayoutEffect`, not `useEffect`, or view-transition snapshots capture unplaced elements.
- `apps/site/vite.config.ts` aliases `halo-ui-react/*` to library source. Moving a library entry breaks the site build until the alias is updated.
- `lib/cable.ts` is a Verlet simulation: cables are 0.994 of the rest gap so they stay taut, tension straightens them, and the pane's top edge is a surface slack can rest on. A zero-length cable must not be stepped (guarded).
- The domain is `haloui.dev` but the package is `halo-ui-react`. When renaming, never touch `haloui.dev`.

## Current state (2026-11-16)

Live at haloui.dev, `main` at the latest commit, all checks green.

- Every route is prerendered (`docs/toast.html`, served without a trailing slash) with its own title, description, canonical, Open Graph tags and a 1200x630 image (`public/og/`). Real 404s, `robots.txt`, `sitemap.xml`, `/docs` 301s to `/docs/getting-started`, every docs page has a `.md` twin, and `/llms.txt` follows the llms.txt spec. Verified with curl on production.
- Docs and Playground are lazy chunks; home JS is about 115 kB gzipped.
- Home: eyebrow "An alternative to Sonner and Vaul", headline "Toasts and drawers that keep the speed of your flick.", a facts strip read from the package, Why springs (a throw-and-retarget demo with a live speed graph, `components/why-springs.tsx`), four extra toast types, Worlds as one sample and a switcher, and a "Get started" close.
- Docs (11 pages, grouped): Getting started, Next.js and SSR, Migrate from Sonner, Migrate from Vaul, Toast, Drawer, Worlds, Motion, Customize, Accessibility, For agents.
- CI on pull requests and pushes to `main`: typecheck, tests, build, the size check, and the Playwright suite. Tag pushes (`v*`) run `publish.yml`.
- npm: 0.1.0 is `latest`. The README, description and keywords changed since, so they reach npm only with 0.1.1 (`CHANGELOG.md` has them under Unreleased). The 291 downloads on launch day were registry mirrors and scanners: 148 were for the `0.0.0-stage` placeholder.

## Decisions not to undo

- The eyebrow says "An alternative to", not "Drop-in for": the Vaul migration removes Portal and Overlay and renames three props, and some Sonner features have no equivalent (see the Migrate pages).
- No GitHub star count in the facts strip until it helps rather than hurts.
- The old flick test was replaced because both sides looked the same on any normal drag. Why springs uses the drawer's default spring (0.5 s, bounce 0.12) and docks at plus or minus 20% of the lane; longer trips or the stiffer toast spring made the two lines look alike again.
- Sizes are measured by `packages/react/scripts/size.mjs` (esbuild minify, React external, gzip -9, 1 kB = 1000 bytes). Toast is 8.5 kB, not the 8.4 once typed by hand.
- The Next.js guide is verified against Next.js 16.4.3: `<Drawer.Root>` in a server component fails the build ("Element type is invalid ... got: undefined"), so drawers go in client components.
- The SEO brief (from a copy and SEO consultant) was applied with corrections: its flick-test verdict had Sonner backwards, it assumed Cloudflare Pages rather than Workers, and its `index.html`-per-route layout would add trailing-slash redirects.

## Waiting on the owner

1. Run `npm login`, then `npm deprecate halo-ui-react@0.0.0-stage "Placeholder from staged publishing; install halo-ui-react@latest"` (it failed with a 404 because npm was logged out).
2. Add the trusted publisher on npmjs.com: user `akerpelm`, repository `halo`, workflow `publish.yml`, no environment, allow `npm publish`. Then an agent prepares 0.1.1 and the owner pushes the tag.
3. Test on a real iPhone in Safari, and in Firefox. Nothing has been checked on a real device.
4. Cloudflare AI crawler settings (allow search and agent bots; decide on training bots), Search Console and Bing verification with the sitemap, GitHub topics, description and social preview image.
5. Decide: on phones the hero's pane sits below the facts strip, so the headline's claim has nothing to touch near it. Move the pane up, or change the button to "Fire a toast, then flick it".
6. Decide: grow beyond Toast and Drawer, or stay at two until launch traction (recommended).
7. Decide: keep or soften "Accessibility bugs are fixed first" on the Accessibility page.

## Next for agents, in priority order

1. Once item 2 above is done, prepare 0.1.1: move Unreleased to `## 0.1.1 (date)`, bump the version, run the checks, commit, and ask the owner to push `v0.1.1`.
2. Docs P2: guides (custom content, async and promises, streaming, undo, multiple toasters, a drawer with a form, nested drawers, testing) and reference pages (types, browser support, troubleshooting, the spring engine, a worlds comparison with render cost). Each needs a `routes.ts` entry, a `docPages` entry and an OG image (`pnpm --filter haloui-site og`).
3. If Why springs still doesn't land for the owner: a fading trail of recent positions on both panes, so the difference shows without reading the graph.
4. A demo GIF for the README and a short loop of Why springs.
5. Publish the shadcn registry (`/r/toast.json`, `/r/drawer.json`), then submit to the shadcn directory and 21st.dev.
6. Analytics events need a tool choice first: Cloudflare Web Analytics has no custom events.
7. Consider trimming the toast bundle.
