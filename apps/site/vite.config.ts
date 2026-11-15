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
      { find: 'haloui/styles.css', replacement: lib('styles.css') },
      { find: 'haloui/spring', replacement: lib('spring/index.ts') },
      { find: 'haloui/toast', replacement: lib('toast/index.ts') },
      { find: 'haloui/drawer', replacement: lib('drawer/index.ts') },
      { find: /^haloui$/, replacement: lib('index.ts') },
    ],
  },
});
