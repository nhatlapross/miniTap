import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { LineChart, LayoutDashboard, History, Wallet as WalletIcon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import { useAutoConnect } from "./hooks/useAutoConnect";
import { WalletStatus } from "./components/WalletStatus";
import { BalanceCard } from "./components/BalanceCard";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { TradingView } from "./components/TradingView";
import { TradeHistory, type TradeRecord } from "./components/TradeHistory";
import { VerificationDashboard } from "./components/VerificationDashboard";
import { useGameStore } from "./store";

import "./App.css";

function AppContent() {
  useAutoConnect(); 
  const { isConnected, isConnecting } = useAccount();
  
  const [activeTab, setActiveTab] = useState<'trade' | 'history' | 'verify' | 'wallet'>('trade');
  
  const updatePrice = useGameStore((state) => state.updatePrice);
  const currentPrice = useGameStore((state) => state.currentPrice);
  const bets = useGameStore((state) => state.bets);
  const pendingWins = useGameStore((state) => state.pendingWins);
  
  // Transform Zustand state for HistoryView (mock adapter)
  const [trades, setTrades] = useState<TradeRecord[]>([]);

  // Simulate fast ticking BTC Price (every 100ms for buttery smooth grid tracking)
  useEffect(() => {
    let lastPrice = currentPrice || 64250;
    const interval = window.setInterval(() => {
      const movement = (Math.random() - 0.5) * 6; // move by -$3 to +$3 fast
      lastPrice = lastPrice + movement;
      updatePrice(lastPrice);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Adapt grid bets into standard history interface
  useEffect(() => {
      const newTrades: TradeRecord[] = [];
      const allIds = new Set([...Object.keys(bets), ...Object.keys(pendingWins)]);
      for (const id of allIds) {
          const parts = id.split(':');
          const isPending = bets[id] > 0 && !pendingWins[id];
          newTrades.push({
              id,
              timestamp: Number(parts[0]),
              direction: 'UP', // Grid abstracts direction
              entryPrice: Number(parts[2]) + 10,
              closePrice: null,
              result: pendingWins[id] > 0 ? 'WIN' : isPending ? 'PENDING' : 'LOSS',
              amount: bets[id] || (pendingWins[id] / 2) // Rough estimate for loss display
          });
      }
      setTrades(newTrades.sort((a,b) => b.timestamp - a.timestamp));
  }, [bets, pendingWins]);


  return (
    <div className="app-container">
      <Toaster position="top-center" />
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">M</div>
          <h1 className="app-title">MiniTap</h1>
        </div>
        <div className="wallet-badge">
          <div className={`status-dot ${isConnected ? '' : 'disconnected'}`}></div>
          {isConnected ? 'Connected' : 'Waiting...'}
        </div>
      </header>

      <main className={`app-main ${activeTab === 'trade' ? 'trade-mode' : ''}`}>
        {!isConnected && !isConnecting && (
          <section className="glass-panel m-4 text-center p-8">
            <h2 className="section-title justify-center">Welcome to MiniTap</h2>
            <p className="text-gray-400 mb-6">
              We're waiting for MiniPay connection...
            </p>
            <WalletStatus />
          </section>
        )}

        {isConnected && (
          <>
            <div style={{ display: activeTab === 'trade' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
              <TradingView />
            </div>

            <div style={{ display: activeTab === 'history' ? 'block' : 'none', padding: '16px' }}>
              <TradeHistory trades={trades} />
            </div>

            <div style={{ display: activeTab === 'verify' ? 'block' : 'none', padding: '16px' }}>
              <VerificationDashboard />
            </div>

            <div style={{ display: activeTab === 'wallet' ? 'flex' : 'none', flexDirection: 'column', gap: '24px', padding: '16px' }}>
              <BalanceCard />
              <div className="glass-panel">
                <WalletStatus />
              </div>
            </div>
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'trade' ? 'active' : ''}`}
          onClick={() => setActiveTab('trade')}
        >
          <LineChart size={24} />
          <span>Trade</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={24} />
          <span>History</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'verify' ? 'active' : ''}`}
          onClick={() => setActiveTab('verify')}
        >
          <LayoutDashboard size={24} />
          <span>Verify</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
        >
          <WalletIcon size={24} />
          <span>Wallet</span>
        </button>
      </nav>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
