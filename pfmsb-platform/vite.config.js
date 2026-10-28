import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Built into dist/, then inlined by inline.mjs into ../PFMSB_Canopy.html
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', emptyOutDir: true },
});
