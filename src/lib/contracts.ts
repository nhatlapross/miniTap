// src/lib/contracts.ts
// Known contract addresses for Celo tokens
import { type Address } from "viem";

export type TokenSymbol = "cUSD" | "USDC" | "USDT" | "CELO";

interface TokenConfig {
  symbol: TokenSymbol;
  name: string;
  address: Address;
  decimals: number;
  icon: string;
  color: string;
}

// Celo Mainnet token addresses
export const MAINNET_TOKENS: Record<TokenSymbol, TokenConfig> = {
  cUSD: {
    symbol: "cUSD",
    name: "Celo Dollar",
    address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    decimals: 18,
    icon: "💵",
    color: "#35D07F",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    decimals: 6,
    icon: "🔵",
    color: "#2775CA",
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
    decimals: 6,
    icon: "🟢",
    color: "#50AF95",
  },
  CELO: {
    symbol: "CELO",
    name: "CELO",
    address: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    decimals: 18,
    icon: "🟡",
    color: "#FCFF52",
  },
};

// Celo Sepolia Testnet token addresses
export const TESTNET_TOKENS: Partial<Record<TokenSymbol, TokenConfig>> = {
  cUSD: {
    symbol: "cUSD",
    name: "Celo Dollar",
    address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
    decimals: 18,
    icon: "💵",
    color: "#35D07F",
  },
};

/**
 * Get token config by symbol.
 * Throws if symbol unknown.
 */
export function getTokenConfig(symbol: TokenSymbol): TokenConfig {
  const config = MAINNET_TOKENS[symbol];
  if (!config) {
    throw new Error(`Unknown token: ${symbol}`);
  }
  return config;
}

// ERC-20 minimal ABI for reading balance, decimals, symbol
export const erc20Abi = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
