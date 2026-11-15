# Contributing to Halo

Thanks for helping. Issues and pull requests are welcome at [github.com/akerpelm/halo](https://github.com/akerpelm/halo).

## Layout

```
packages/react   halo-ui-react, the library (tsup, no runtime dependencies besides React)
apps/site        haloui.dev: showcase, docs, and playground (Vite, React, Tailwind v4), prerendered at build time
```

Each library component is a folder of parts, and each part is a folder of its component and the hooks that only it uses.

```
src/
  spring/     the closed-form solver, spring values, and the shared frame loop
  gesture/    velocity tracking, rubber-banding, and flick projection
  utils/      appearance tokens, media queries, scroll lock, controllable state
  drawer/     root, trigger, content, handle, title, description, close, scroll
  toast/      store, toaster, toast-item, icons
```

`drawer/index.parts.ts` names the parts (`Drawer.Root`, `Drawer.Content`, …) and `drawer/index.ts` exports them as one namespace. Behaviour that would otherwise crowd a component lives in a named hook beside it: `content/use-drawer-drag.ts`, `toast-item/use-toast-swipe.ts`, `toaster/use-live-announcer.ts`.

## Develop

pnpm 10 and Node 22 (`.node-version`).

```sh
pnpm install
pnpm dev                              # builds the library, then runs the site with library source aliased in
pnpm test                             # springs, gestures, the store, the Toaster, and the Drawer
pnpm typecheck
pnpm build                            # the library, then the prerendered site
pnpm --filter haloui-site test:e2e    # Playwright: axe, overflow, keyboard, transitions, reduced motion, SEO
pnpm --filter halo-ui-react size      # rewrite sizes.json and the README size tables after a library change
```

CI runs typecheck, tests, the build, the size check, and the Playwright suite on every pull request.

## Before you open a pull request

- Bring a library change under test, and break the code on purpose once to see the test fail.
- For anything visual, check 320 to 1440 px, light and dark, and reduced motion.
- Read `CLAUDE.md` for the code rules and `DESIGN.md` before changing how anything looks.

## License

By contributing, you agree that your contributions are licensed under the MIT License.
