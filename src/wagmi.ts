// src/wagmi.ts
import { configureChains, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { InjectedConnector } from "wagmi/connectors/injected";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider, webSocketProvider } = configureChains(
  [base],
  [publicProvider()]
);

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
