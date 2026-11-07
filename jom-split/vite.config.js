import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Satu fail HTML sahaja supaya mudah dibuka terus atau diterbitkan sebagai artifact.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: { target: 'es2020', chunkSizeWarningLimit: 900 },
});
