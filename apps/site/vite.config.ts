import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const lib = (path: string) => fileURLToPath(new URL(`../../packages/react/src/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${fileURLToPath(new URL('./src/', import.meta.url))}` },
      { find: 'halo-ui-react/styles.css', replacement: lib('styles.css') },
      { find: 'halo-ui-react/spring', replacement: lib('spring/index.ts') },
      { find: 'halo-ui-react/toast', replacement: lib('toast/index.ts') },
      { find: 'halo-ui-react/drawer', replacement: lib('drawer/index.ts') },
      { find: /^halo-ui-react$/, replacement: lib('index.ts') },
    ],
  },
});
