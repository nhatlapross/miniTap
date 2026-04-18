// src/components/WalletStatus.tsx
import { useAccount } from "wagmi";
import { Spinner } from "./Spinner";

export function WalletStatus() {
  const { address, isConnected, isConnecting, chain } = useAccount();

  if (isConnecting) {
    return (
      <div className="wallet-status connecting" id="wallet-status">
        <Spinner size={18} />
        <span>Connecting to MiniPay...</span>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="wallet-status disconnected" id="wallet-status">
        <div className="status-indicator" />
        <span>Please open this app from MiniPay to connect to your wallet.</span>
      </div>
    );
  }

  return (
    <div className="wallet-status connected" id="wallet-status">
      <div className="status-indicator active" />
      <div className="wallet-info">
        <p className="wallet-address">
          {address.slice(0, 6)}...{address.slice(-4)}
        </p>
        {chain && <p className="wallet-chain">{chain.name}</p>}
      </div>
    </div>
  );
}
