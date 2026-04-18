// src/env.ts
// Optional: provider detection and env validation

// Extend Window interface for injected Ethereum provider
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isMiniPay?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

/**
 * Get the injected Ethereum provider.
 * Throws if window.ethereum is not available (i.e. not running inside MiniPay).
 */
export function getEthereumProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error(
      "window.ethereum is required. Please run this app inside MiniPay."
    );
  }
  return window.ethereum;
}

/**
 * Detect if the app is running inside MiniPay.
 */
export function isMiniPay(): boolean {
  return (
    typeof window !== "undefined" &&
    window.ethereum?.isMiniPay === true
  );
}
