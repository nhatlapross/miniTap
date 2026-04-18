import { useTokenBalances } from "../hooks/useTokenBalance";
import { Spinner } from "./Spinner";
import { Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export function BalanceCard() {
  const { balances, isLoading, isError, refetch } = useTokenBalances(["USDT", "cUSD"]);

  const totalValue = balances.reduce((acc, curr) => acc + Number(curr.formatted), 0);

  const handleDeposit = () => {
    // Deep link to MiniPay App cash-in
    window.location.href = "minipay://add-cash";
  };

  return (
    <div className="glass-panel" style={{ padding: '0' }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--card-border)' }}>
        <div className="flex-row justify-between" style={{ marginBottom: '16px' }}>
          <div className="flex-row" style={{ gap: '8px', color: 'var(--text-secondary)' }}>
            <Wallet size={20} />
            <span style={{ fontWeight: 600 }}>Trading Balance</span>
          </div>
          <button onClick={() => refetch()} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <Spinner size={24} />
          </div>
        ) : isError ? (
          <div style={{ color: 'var(--danger-red)' }}>Failed to load balances</div>
        ) : (
          <div className="value-display" style={{ margin: 0 }}>
            ${totalValue.toFixed(2)}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button className="btn btn-primary" style={{ flex: 1, minHeight: '40px', padding: '10px' }} onClick={handleDeposit}>
            <ArrowDownToLine size={18} />
            Deposit
          </button>
          <button className="btn btn-secondary" style={{ flex: 1, minHeight: '40px', padding: '10px' }} onClick={() => alert("Withdrawal requested")}>
            <ArrowUpFromLine size={18} />
            Withdraw
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>ASSETS</div>
        {!isLoading && !isError && balances.map(token => (
          <div key={token.symbol} className="flex-row justify-between" style={{ marginBottom: '8px' }}>
            <div className="flex-row" style={{ gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>{token.icon}</span>
              <span style={{ fontWeight: 500 }}>{token.symbol}</span>
            </div>
            <span style={{ fontWeight: 600 }}>{token.formatted}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
