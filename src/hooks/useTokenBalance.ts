// src/hooks/useTokenBalance.ts
import { type Address, erc20Abi } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { MAINNET_TOKENS, type TokenSymbol } from "../lib/contracts";

interface TokenBalance {
  symbol: TokenSymbol;
  name: string;
  balance: bigint;
  decimals: number;
  formatted: string;
  icon: string;
  color: string;
}

/**
 * Batch-read multiple token balances in a single multicall.
 * Returns formatted balances for the connected wallet.
 */
export function useTokenBalances(symbols: TokenSymbol[] = ["cUSD", "USDC", "CELO"]) {
  const { address } = useAccount();

  const contracts = symbols.map((sym) => ({
    address: MAINNET_TOKENS[sym].address as Address,
    abi: erc20Abi,
    functionName: "balanceOf" as const,
    args: [address!] as readonly [Address],
  }));

  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: !!address,
      staleTime: 30_000, // Cache 30s to avoid redundant RPC calls
    },
  });

  const balances: TokenBalance[] = symbols.map((sym, i) => {
    const token = MAINNET_TOKENS[sym];
    const rawBalance = data?.[i]?.result as bigint | undefined;
    const balance = rawBalance ?? 0n;

    // Format with proper decimals
    const divisor = 10n ** BigInt(token.decimals);
    const whole = balance / divisor;
    const fraction = balance % divisor;
    const fractionStr = fraction.toString().padStart(token.decimals, "0").slice(0, 2);
    const formatted = `${whole.toString()}.${fractionStr}`;

    return {
      symbol: sym,
      name: token.name,
      balance,
      decimals: token.decimals,
      formatted,
      icon: token.icon,
      color: token.color,
    };
  });

  return { balances, isLoading, isError, refetch };
}
