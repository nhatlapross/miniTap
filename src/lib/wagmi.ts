// src/lib/wagmi.ts
import { http } from "viem";
import { createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { celo, celoSepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [celo, celoSepolia],
  connectors: [
    injected(), // MiniPay injects window.ethereum
  ],
  transports: {
    [celo.id]: http(),
    [celoSepolia.id]: http(),
  },
});
