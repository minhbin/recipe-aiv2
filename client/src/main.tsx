import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { loadFonts } from "./lib/fonts";

// Load fonts
loadFonts();

createRoot(document.getElementById("root")!).render(<App />);
