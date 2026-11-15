# Halo

Spring-physics Toast and Drawer for React, and the site that shows them off: docs, worlds, a playground, and agent prompts.

**[haloui.dev](https://haloui.dev)** · [`@halo-ui/react` on npm](https://www.npmjs.com/package/@halo-ui/react)

```
packages/react   @halo-ui/react, the library (tsup, no runtime dependencies besides React)
apps/site        haloui.dev: showcase, docs, and playground (Vite, React, Tailwind v4)
```

## The library

Each component is a folder of parts, and each part is a folder of its component and the hooks that only it uses.

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

```sh
pnpm install
pnpm dev         # builds the library, then runs the site with library source aliased in
pnpm test        # springs, gestures, the store, the Toaster, and the Drawer
pnpm typecheck
pnpm build
```

Design decisions for the site are in `DESIGN.md`; product context is in `PRODUCT.md`.

## License

MIT
