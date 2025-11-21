import React from "react";
import { createRoot } from "react-dom/client";
import { WagmiConfig } from "wagmi";
import { config } from "./wagmi";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
);
