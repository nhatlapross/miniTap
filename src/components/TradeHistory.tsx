import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export type TradeRecord = {
  id: string;
  timestamp: number;
  direction: 'UP' | 'DOWN';
  entryPrice: number;
  closePrice: number | null;
  result: 'WIN' | 'LOSS' | 'PENDING';
  amount: number;
};

export function TradeHistory({ trades }: { trades: TradeRecord[] }) {
  if (trades.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
        No trades yet. Tap UP or DOWN to start!
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '0' }}>
      <div className="card-header" style={{ padding: '20px', borderBottom: '1px solid var(--card-border)' }}>
        <h3 className="section-title" style={{ margin: 0 }}>Recent Trades</h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {trades.map((trade, i) => (
          <div key={trade.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: i < trades.length - 1 ? '1px solid var(--card-border)' : 'none',
            background: trade.result === 'PENDING' ? 'rgba(255,255,255,0.02)' : 'transparent'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="flex-row" style={{ gap: '8px' }}>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: trade.direction === 'UP' ? 'var(--success-green)' : 'var(--danger-red)'
                }}>
                  {trade.direction}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  ${trade.entryPrice.toFixed(2)}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {new Date(trade.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              {trade.result === 'PENDING' ? (
                <div className="flex-row" style={{ gap: '6px', color: 'var(--accent-cyan)' }}>
                  <Clock size={16} className="animate-pulse" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>LIVE</span>
                </div>
              ) : trade.result === 'WIN' ? (
                <div className="flex-row" style={{ gap: '6px', color: 'var(--success-green)' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>+${(trade.amount * 1.8).toFixed(2)}</span>
                  <CheckCircle2 size={18} />
                </div>
              ) : (
                <div className="flex-row" style={{ gap: '6px', color: 'var(--danger-red)' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>-${trade.amount.toFixed(2)}</span>
                  <XCircle size={18} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
