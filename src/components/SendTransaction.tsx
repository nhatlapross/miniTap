// src/components/SendTransaction.tsx
import { useState } from "react";
import { parseUnits, isAddress, type Address } from "viem";
import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { Spinner } from "./Spinner";

/**
 * Handle transaction errors with user-friendly messages.
 * Prefer error codes over message text (provider messages can change).
 */
function handleTransactionError(error: Error & { code?: number }): string {
  if (error.code === -32604 || error.name === "UserRejectedRequestError") {
    return "Transaction was cancelled.";
  }
  if (error.message?.includes("insufficient funds")) {
    return "Insufficient funds. Please add more CELO.";
  }
  return "Transaction failed. Please try again.";
}

export function SendTransaction() {
  const { isConnected } = useAccount();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [userError, setUserError] = useState<string | null>(null);

  const {
    data: hash,
    isPending,
    sendTransaction,
    error: sendError,
    reset,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setUserError(null);

    // Validate input
    if (!to.trim()) {
      setUserError("Please enter a destination address.");
      return;
    }
    if (!isAddress(to)) {
      setUserError("Invalid destination address.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setUserError("Amount must be greater than 0.");
      return;
    }

    try {
      sendTransaction(
        {
          to: to as Address,
          value: parseUnits(amount, 18),
        },
        {
          onError: (error) => {
            console.error("Transaction error:", error);
            setUserError(
              handleTransactionError(error as Error & { code?: number })
            );
          },
        }
      );
    } catch (err) {
      console.error("Send error:", err);
      setUserError("Failed to send transaction.");
    }
  }

  function handleReset() {
    setTo("");
    setAmount("");
    setUserError(null);
    reset();
  }

  if (!isConnected) return null;

  // Success state
  if (isSuccess && hash) {
    return (
      <section className="card send-card" id="send-section">
        <h2>Send CELO</h2>
        <div className="tx-success">
          <div className="tx-success-icon">✅</div>
          <p className="tx-success-title">Transaction confirmed!</p>
          <a
            className="tx-hash-link"
            href={`https://celoscan.io/tx/${hash}`}
            rel="noopener noreferrer"
          >
            View on CeloScan ↗
          </a>
          <button className="btn btn-primary" onClick={handleReset}>
            Send another
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card send-card" id="send-section">
      <h2>Send CELO</h2>

      <form onSubmit={handleSend} className="send-form">
        <div className="input-group">
          <label htmlFor="send-to">To address</label>
          <input
            id="send-to"
            type="text"
            placeholder="0x..."
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={isPending || isConfirming}
            autoComplete="off"
          />
        </div>

        <div className="input-group">
          <label htmlFor="send-amount">Amount (CELO)</label>
          <input
            id="send-amount"
            type="number"
            placeholder="0.00"
            step="any"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending || isConfirming}
          />
        </div>

        {/* Transaction feedback */}
        {isPending && (
          <div className="tx-status tx-pending">
            <Spinner size={16} />
            <span>Preparing transaction...</span>
          </div>
        )}
        {isConfirming && (
          <div className="tx-status tx-confirming">
            <Spinner size={16} />
            <span>Waiting for confirmation...</span>
          </div>
        )}
        {hash && !isSuccess && !isConfirming && (
          <div className="tx-status tx-submitted">
            <span>Transaction submitted</span>
            <a
              className="tx-hash-link"
              href={`https://celoscan.io/tx/${hash}`}
              rel="noopener noreferrer"
            >
              View on CeloScan ↗
            </a>
          </div>
        )}

        {/* Error display */}
        {(userError || sendError) && (
          <div className="tx-status tx-error">
            <span>
              {userError ||
                handleTransactionError(sendError as Error & { code?: number })}
            </span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-send"
          disabled={isPending || isConfirming}
          id="send-btn"
        >
          {isPending
            ? "Preparing..."
            : isConfirming
              ? "Confirming..."
              : "Send"}
        </button>
      </form>
    </section>
  );
}
