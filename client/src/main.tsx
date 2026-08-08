import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("[QuickMed] Initializing React App...");

const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    createRoot(rootElement).render(<App />);
  } catch (err) {
    console.error("[QuickMed] Error rendering React App:", err);
  }
} else {
  console.error("[QuickMed] Target container #root not found in document.");
}
