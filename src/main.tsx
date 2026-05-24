import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";
import { initializePWAInstall } from "./lib/pwaInstallStore";

initializePWAInstall();

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true).then(() => window.location.reload());
  },
  onNeedReload() {
    window.location.reload();
  },
  onRegisteredSW(_swScriptUrl, registration) {
    registration?.update();
  },
  onRegisterError(error) {
    console.error("PWA service worker registration failed", error);
  },
});

createRoot(document.getElementById("root")!).render(<App />);
