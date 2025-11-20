// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { WagmiConfig } from "wagmi";
import { wagmiClient } from "./wagmi";
import App from "./app";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
);
