import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    toast: 'src/toast/index.ts',
    drawer: 'src/drawer/index.ts',
    spring: 'src/spring/index.ts',
    popover: 'src/popover/index.ts',
    swipe: 'src/swipe/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
  banner: { js: "'use client';" },
});
