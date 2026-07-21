import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
