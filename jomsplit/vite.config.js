import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Built into dist/, then inlined by inline.mjs into ../JomSplit.html
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', emptyOutDir: true },
});
