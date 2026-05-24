import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializePWAInstall } from "./lib/pwaInstallStore";

initializePWAInstall();

createRoot(document.getElementById("root")!).render(<App />);
