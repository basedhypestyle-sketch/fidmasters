// src/wagmi.ts
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { InjectedConnector } from "wagmi/connectors/injected";

/**
 * Safe/guarded connector loader:
 * - avoids failing npm install/build when optional connector packages are not published.
 * - will add connectors at runtime only if the packages exist in node_modules.
 */

const connectors: any[] = [];

// always include injected (MetaMask / extension)
connectors.push(new InjectedConnector({ chains: [base] }));

// try optional connectors (require will throw if package absent)
try {
  // Example: farcasterFrame connector package (if/when available)
  // const { farcasterFrame } = require("@farcaster/frame-wagmi-connector");
  // if (typeof farcasterFrame === "function") connectors.push(farcasterFrame());
} catch (e) {
  // ignore
}

try {
  // WalletConnect v1/v2 connector via wagmi package (if installed)
  const wcModule = require("wagmi/connectors/walletConnect");
  const walletConnect = wcModule?.walletConnect || wcModule?.WalletConnectConnector || null;
  if (walletConnect) connectors.push(walletConnect({ projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id" }));
} catch (e) {
  // ignore
}

try {
  const cbModule = require("wagmi/connectors/coinbaseWallet");
  const coinbaseWallet = cbModule?.coinbaseWallet || cbModule?.CoinbaseWalletConnector || null;
  if (coinbaseWallet) connectors.push(coinbaseWallet({ appName: "Fid Master" }));
} catch (e) {
  // ignore
}

export const config = createConfig({
  autoConnect: true,
  connectors,
  transports: {
    [base.id]: http()
  }
});
