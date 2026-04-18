import React, { useEffect, useState } from "react";
import { TradingGrid } from "./TradingGrid";
import { useGameStore } from "../store";

const generateRandomAddress = () => {
  let address = "0x";
  for (let i = 0; i < 40; i++) {
    address += Math.floor(Math.random() * 16).toString(16);
  }
  return address;
};

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const truncateAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const TradingView: React.FC = () => {
  const ensureCells = useGameStore((state) => state.ensureCells);
  const tickTime = useGameStore((state) => state.tickTime);
  const [feedNotification, setFeedNotification] = useState<{
    id: number;
    user: string;
    amount: string;
  } | null>(null);

  useEffect(() => {
    // Generate initial grid and start simulation
    ensureCells();

    // Mock grid tick every 1000ms
    const tickInterval = setInterval(() => {
      tickTime();
    }, 1000);

    return () => {
      clearInterval(tickInterval);
    };
  }, [ensureCells, tickTime]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let isUnmounted = false;

    const pushFakeWinNotification = () => {
      if (isUnmounted) return;

      const user = generateRandomAddress();
      const amount = (Math.random() * 500 + 10).toFixed(2);

      setFeedNotification({
        id: Date.now(),
        user,
        amount,
      });

      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!isUnmounted) setFeedNotification(null);
      }, 4500);

      timer = setTimeout(pushFakeWinNotification, randomInt(2000, 13000));
    };

    timer = setTimeout(pushFakeWinNotification, randomInt(2000, 13000));

    return () => {
      isUnmounted = true;
      if (timer) clearTimeout(timer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  // Use explicit height: the viewport minus header (60px) and bottom nav (80px)
  return (
    <div
      className="relative overflow-hidden w-full"
      style={{ height: 'calc(100vh - 60px - 80px)' }}
    >
      {/* Ambient Glow */}
      <div
        className="absolute top-1/4 left-1/4 w-[200px] h-[200px] rounded-full pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(8, 71, 247,0.15) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative z-10 w-full h-full flex flex-col"
        style={{
          background: 'var(--card-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--card-border)',
          borderRadius: '16px',
          margin: '8px',
          width: 'calc(100% - 16px)',
          height: 'calc(100% - 16px)',
        }}
      >
        {feedNotification ? (
          <div className="pointer-events-none absolute left-3 top-3 z-30">
            <div
              key={feedNotification.id}
              style={{
                width: 'fit-content',
                borderRadius: '8px',
                border: '1px solid rgba(46, 189, 133, 0.4)',
                padding: '4px 8px',
                background: "rgba(11, 16, 28, 0.8)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(46, 189, 133, 0.1)",
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', height: '20px', width: '20px', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', background: 'rgba(34,197,94,0.2)', fontSize: '10px', border: '1px solid rgba(34,197,94,0.3)' }}>
                  🚀
                </div>
                <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
                  {truncateAddress(feedNotification.user)}
                </span>
                <span style={{ borderRadius: '4px', background: 'rgba(34,197,94,0.2)', padding: '0 4px', fontSize: '9px', fontWeight: 700, color: '#4ade80' }}>
                  WIN
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#4ade80' }}>
                  +${feedNotification.amount}
                </span>
              </div>
            </div>
          </div>
        ) : null}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', color: '#d1d5db', flexShrink: 0 }}>
           <div style={{ fontSize: '12px', fontWeight: 700 }}>BTC/USDT GRID</div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '4px 8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span> LIVE
           </div>
        </div>

        {/* Grid takes all remaining space - explicit flex:1 with min-height:0 to allow shrinking */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <TradingGrid />
        </div>
      </div>
    </div>
  );
};
