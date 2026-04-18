// vite.config.ts
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Allow ngrok hosts for testing in MiniPay
    allowedHosts: [".ngrok.app", ".ngrok-free.dev", ".ngrok-free.app"],
  },
  build: {
    outDir: "dist",
  },
});
