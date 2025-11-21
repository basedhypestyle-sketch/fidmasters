// src/wagmi.ts
import { configureChains, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { InjectedConnector } from "wagmi/connectors/injected";
import { publicProvider } from "wagmi/providers/public";

/**
 * Simple wagmi config using configureChains + publicProvider.
 * This avoids using `http()` transport which may not be exported by your wagmi version.
 */

// configure chains + provider
const { chains, provider, webSocketProvider } = configureChains(
  [base],
  [
    publicProvider(), // simple, no API key required
  ]
);

// connectors
const injected = new InjectedConnector({
  chains,
  options: { shimDisconnect: true },
});

export const config = createConfig({
  autoConnect: true,
  connectors: [injected],
  provider,
  webSocketProvider,
});
