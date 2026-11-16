# Halo

Spring-physics Toast and Drawer for React, with a frosted-glass material and nine visual worlds.

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

Entry points: `halo-ui-react`, `halo-ui-react/toast`, `halo-ui-react/drawer`, `halo-ui-react/spring`, `halo-ui-react/styles.css`. The public API is `toast()`, `<Toaster>`, the `Drawer` namespace, `useDrawer`, and the spring helpers. Do not change it without a version bump and a docs update.

## Commands

```sh
pnpm install
pnpm dev         # builds the library, then runs the site with library source aliased in
pnpm test        # 50 tests
pnpm typecheck
pnpm build
pnpm --filter haloui-site test:e2e   # Playwright browser checks against a preview build
pnpm --filter halo-ui-react size     # after a library build: rewrite sizes.json and the size tables in both READMEs
pnpm --filter haloui-site og         # regenerate public/og/*.png after changing a route title
```

pnpm 10, Node 22 (`.node-version`). Run builds one after another: a stale `tsup --watch` from an earlier `pnpm dev` can empty `dist` mid-build. Restart `pnpm dev` after changing `tsup.config.ts`.

## Rules

- Never type a bundle size, the version or the React peer range by hand. Read them from `packages/react/sizes.json` and `package.json` (`apps/site/src/lib/package-facts.ts`). CI fails when `sizes.json` is stale.

- No comments in code. The only exception is JSDoc on the library's public API.
- TypeScript strict. `type` over `interface`, named exports, one component per file, kebab-case file names. No `any`, no non-null `!`.
- Library structure follows Base UI: a folder per part, `index.parts.ts` naming the parts, and a named hook beside a component for any behaviour that would crowd it (`use-drawer-drag.ts`, `use-toast-swipe.ts`).
- Tailwind v4 with tokens in `@theme`; no raw hex in components. `cn()` for conditional classes.
- Animate transform and opacity only. Every animation honours `prefers-reduced-motion`.
- Accessibility is required: WCAG AA contrast, a visible `:focus-visible` ring on everything interactive, 44px targets on coarse pointers, semantic HTML first.
- Smallest change that solves the problem. Plan multi-file changes in a few bullets before building.
- Small commits, imperative subject (`add`, `fix`, `remove`). Ask before pushing, force-pushing, or publishing to npm.

## Verifying a change

Typecheck, test and build before every commit. CI runs those plus the Playwright checks (`apps/site/e2e`) on every pull request. The Playwright suite covers axe, overflow, the keyboard walk, page transitions and reduced motion in Chromium; for anything visual, still open the page in a browser and check:

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

## Open items, in priority order

1. Test on a real iPhone in Safari, and in Firefox. Everything so far was verified only in headless Chrome.
2. Add the trusted publisher on npmjs.com (repo akerpelm/halo, workflow `publish.yml`), then release 0.1.1 so the new README, description and keywords reach npm.
3. Owner-only, from the SEO brief: Cloudflare AI crawler settings (allow search and agent bots; decide on training bots), Search Console and Bing verification plus sitemap submission, GitHub topics, description and social preview image.
4. Docs P2 from the SEO brief: guides (custom content, async and promises, streaming, undo, multiple toasters, a drawer with a form, nested drawers, testing), and reference pages (types, browser support, troubleshooting, changelog, the spring engine, a worlds comparison table with render cost).
5. A looping recording of the flick test for people who don't drag, and a demo GIF for the README.
6. Confirm the Next.js guide (`/docs/nextjs`) in a real App Router app: `<Toaster />` in a server layout, and `Drawer.Root` failing from a server component (the guide says to use it in a client component).
7. Analytics events (copy_install, fire_toast, open_drawer, …). Cloudflare Web Analytics has no custom events, so this needs a tool choice first.
8. Publish the shadcn registry (`/r/toast.json`, `/r/drawer.json`), then submit to the shadcn directory and 21st.dev.
9. Consider trimming the toast bundle (see `packages/react/sizes.json`).
