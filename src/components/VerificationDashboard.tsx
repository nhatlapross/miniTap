import { ShieldCheck, Activity, Layers, ExternalLink } from 'lucide-react';

export function VerificationDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="flex-row justify-between" style={{ padding: '0 8px' }}>
        <h3 className="section-title" style={{ margin: 0 }}>Onchain Verification</h3>
        <div className="flex-row" style={{ gap: '4px', color: 'var(--success-green)', fontSize: '0.8rem', fontWeight: 600 }}>
          <ShieldCheck size={14} />
          Verified on Celo
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div className="flex-row" style={{ gap: '12px', marginBottom: '8px' }}>
          <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--accent-cyan)' }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Price Integrity</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Latest 15-min Batch</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success-green)' }}>99.8%</div>
            <a href="#" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'none' }} className="flex-row">
              View Proof <ExternalLink size={10} style={{ marginLeft: '2px' }} />
            </a>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div className="flex-row" style={{ gap: '12px', marginBottom: '8px' }}>
          <div style={{ background: 'rgba(192, 132, 252, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--accent-purple)' }}>
            <Layers size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Settlement Batch</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>0xab3...f912</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>2 mins ago</div>
            <a href="#" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'none' }} className="flex-row">
              CeloScan <ExternalLink size={10} style={{ marginLeft: '2px' }} />
            </a>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div className="flex-row" style={{ gap: '12px', marginBottom: '8px' }}>
          <div style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--success-green)' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Pool Solvency</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reserves vs Liabilities</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success-green)' }}>104.2%</div>
            <a href="#" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'none' }} className="flex-row">
              Audit Report <ExternalLink size={10} style={{ marginLeft: '2px' }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
