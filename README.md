# Halo

Spring-physics Toast and Drawer for React, plus the site that shows them off: docs, design directions, a playground, and agent prompts.

```
packages/react   @halo-ui/react   the library (tsup, zero runtime deps)
apps/site        the showcase, docs, and playground (Vite, React, Tailwind v4)
```

```sh
pnpm install
pnpm dev         # builds the library, then runs the site with library source aliased in for hot reload
pnpm test        # spring math, gestures, store, and Toaster rendering
pnpm typecheck
pnpm build
```

Product context is in `PRODUCT.md`. The site's design direction contract is in `apps/site/.impeccable/surfaces/`.
