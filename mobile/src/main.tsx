import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GameApp } from "@/components/GameApp";
import "../../src/app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("missing_mobile_root");
}

createRoot(root).render(
  <StrictMode>
    <GameApp />
  </StrictMode>,
);
