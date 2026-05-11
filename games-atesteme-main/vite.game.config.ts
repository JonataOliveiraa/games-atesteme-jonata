import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist-games/base-dos-classificadores",
    emptyOutDir: true,
    rollupOptions: {
      input: "game-base-dos-classificadores.html",
    },
  },
});