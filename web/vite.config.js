import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://prm393.up.railway.app",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "https://prm393.up.railway.app",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
