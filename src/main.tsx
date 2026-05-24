import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";
import { initializePWAInstall } from "./lib/pwaInstallStore";

initializePWAInstall();

registerSW({
  immediate: true,
  onRegisterError(error) {
    console.error("PWA service worker registration failed", error);
  },
});

createRoot(document.getElementById("root")!).render(<App />);
