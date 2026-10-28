import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Built into ../pfmsb so the repo's GitHub Pages site serves it at /pfmsb/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: '../pfmsb', emptyOutDir: true },
});
