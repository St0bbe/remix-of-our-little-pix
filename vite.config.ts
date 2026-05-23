import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  base: "/",
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Momentos Especiais",
        short_name: "Família",
        description: "Guarde seus momentos especiais com sua família",
        theme_color: "#e11d48",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
          {
            src: "placeholder.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "placeholder.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));