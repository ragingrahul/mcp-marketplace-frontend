/**
 * Wagmi Configuration
 * Configures wallet connections with support for Base Sepolia network
 * Only MetaMask (injected) is supported
 */

import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(), // MetaMask and other injected wallets
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
