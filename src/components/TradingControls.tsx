import { ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react';

interface TradingControlsProps {
  onTrade: (direction: 'UP' | 'DOWN') => void;
  isTrading: boolean;
  timeLeft: number;
}

export function TradingControls({ onTrade, isTrading, timeLeft }: TradingControlsProps) {
  // If we are currently trading (waiting for resolution), show a loading state
  
  return (
    <div className="glass-panel" style={{ textAlign: 'center' }}>
      <div className="flex-row justify-between" style={{ marginBottom: '24px' }}>
        <div className="flex-row" style={{ gap: '8px' }}>
          <Clock size={20} className="text-secondary" />
          <span className="value-label">Window Closes In</span>
        </div>
        <div className={`value-display ${timeLeft <= 2 ? 'text-red animate-pulse' : ''}`} style={{ margin: 0, fontSize: '1.5rem' }}>
          00:0{timeLeft}s
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button 
          className="btn" 
          onClick={() => onTrade('UP')}
          disabled={isTrading}
          style={{
            flex: 1, 
            background: isTrading ? 'rgba(52, 211, 153, 0.2)' : 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            opacity: isTrading ? 0.5 : 1,
            boxShadow: isTrading ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.4)'
          }}
        >
          <ArrowUpCircle size={24} />
          TAP UP
        </button>
        
        <button 
          className="btn" 
          onClick={() => onTrade('DOWN')}
          disabled={isTrading}
          style={{
            flex: 1, 
            background: isTrading ? 'rgba(251, 113, 133, 0.2)' : 'linear-gradient(135deg, #f43f5e, #e11d48)',
            color: 'white',
            opacity: isTrading ? 0.5 : 1,
            boxShadow: isTrading ? 'none' : '0 4px 20px rgba(244, 63, 94, 0.4)'
          }}
        >
          <ArrowDownCircle size={24} />
          TAP DOWN
        </button>
      </div>

      {isTrading && (
        <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Trade is live! Awaiting resolution...
        </div>
      )}
    </div>
  );
}
