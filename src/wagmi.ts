import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id";

const wagmiAdapter = new WagmiAdapter({
  networks: [base],
  projectId,
});

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

export const config = createConfig({
  autoConnect: true,
  connectors: [
    injected(), // injected wallets
    farcasterFrame(), // farcaster frame connector
    walletConnect({ projectId }), // walletconnect
    coinbaseWallet({ appName: "Fid Master" }),
  ],
  transports: {
    [base.id]: http(),
  },
});
