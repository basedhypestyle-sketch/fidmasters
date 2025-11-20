import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "@wagmi/connectors";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// WalletConnect Project ID
const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id";

// ---- Wagmi Adapter (for AppKit) ----
const wagmiAdapter = new WagmiAdapter({
  networks: [base],
  projectId,
});

// ---- AppKit (Reown) ----
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  projectId,
  metadata: {
    name: "Fid Master",
    description: "Secure your Master — early whitelist",
    url: typeof window !== "undefined" ? window.location.origin : "",
    icons: ["https://fidmasters.vercel.app/icon.png"],
  },
  features: {
    email: true,
    socials: ["farcaster"],
    emailShowWallets: true,
  },
  allWallets: "SHOW",
});

// ---- Wagmi Config (real wallet connectors) ----
export const config = createConfig({
  chains: [base],
  connectors: [
    injected(), // MetaMask, Brave, Rainbow, Coinbase extension
    farcasterFrame(), // Farcaster in-app wallet connector
    walletConnect({ projectId }), // WalletConnect
    coinbaseWallet({ appName: "Fid Master" }), // Coinbase Wallet
  ],
  transports: {
    [base.id]: http(),
  },
});

// Required for wagmi auto-type inference
declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
