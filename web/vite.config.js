import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://prm393-backend.onrender.com",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "https://prm393-backend.onrender.com",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
