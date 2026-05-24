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
      injectRegister: false,
      manifest: {
        name: "Nossa Família",
        short_name: "Nossa Família",
        description: "Family Album Vault: organize, compartilhe e guarde as memorias da familia com seguranca.",
        theme_color: "#e11d48",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
      },
      workbox: {
        cacheId: "nossa-familia-v2",
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globIgnores: ["**/index.html"],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2,webmanifest}"],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "nossa-familia-pages-v2",
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [200],
              },
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 5,
              },
            },
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
