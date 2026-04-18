import React, { useEffect, useRef, useState } from "react";
import { useGameStore, type CellData } from "../store";
import { format } from "date-fns";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

export const TradingGrid: React.FC = () => {
  const cells = useGameStore((state) => state.cells);
  const history = useGameStore((state) => state.history);
  const basePrice = useGameStore((state) => state.basePrice);
  const currentPrice = useGameStore((state) => state.currentPrice);
  const modePriceStep = useGameStore((state) => state.modePriceStep);
  const modeIntervalSeconds = useGameStore((state) => state.modeIntervalSeconds);
  const placeBet = useGameStore((state) => state.placeBet);
  const bets = useGameStore((state) => state.bets);
  const pendingBets = useGameStore((state) => state.pendingBets);
  const pendingWins = useGameStore((state) => state.pendingWins);
  const betAmount = useGameStore((state) => state.betAmount);
  const balance = Math.max(0, useGameStore((state) => state.balance));

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [now, setNow] = useState(() => Date.now());
  const [cameraPrice, setCameraPrice] = useState(currentPrice);

  const triggeredWinsRef = useRef<Set<string>>(new Set());

  // Confetti on win
  useEffect(() => {
    cells.forEach((cell) => {
      const isHit = cell.status === "hit";
      const hasBet = (bets[cell.id] || 0) > 0 || (pendingBets[cell.id] || 0) > 0;
      if (isHit && hasBet) {
        if (!triggeredWinsRef.current.has(cell.id)) {
          triggeredWinsRef.current.add(cell.id);
          const count = 200;
          const defaults = { origin: { y: 0.6 }, zIndex: 10000, scalar: 0.5, ticks: 60 };
          function fire(particleRatio: number, opts: confetti.Options) {
            confetti(Object.assign({}, defaults, opts, { particleCount: Math.floor(count * particleRatio) }));
          }
          fire(0.25, { spread: 26, startVelocity: 55, colors: ["#2ebd85", "#ffffff", "#eab308"] });
          fire(0.2, { spread: 60, colors: ["#2ebd85", "#ffffff", "#eab308"] });
          fire(0.35, { spread: 100, decay: 0.91, scalar: 0.4, colors: ["#2ebd85", "#ffffff", "#eab308"] });
        }
      }
    });
  }, [cells, bets, pendingBets]);

  // Animation / camera loop
  useEffect(() => {
    let frameId: number;
    let lastRenderTime = 0;
    let currentCameraPrice = useGameStore.getState().currentPrice;

    const loop = () => {
      const n = Date.now();
      const target = useGameStore.getState().currentPrice;

      if (currentCameraPrice === 0 && target !== 0) currentCameraPrice = target;
      else currentCameraPrice += (target - currentCameraPrice) * 0.1;

      if (n - lastRenderTime > 16) {
        const state = useGameStore.getState();
        setNow(n);
        setCameraPrice(currentCameraPrice);
        lastRenderTime = n;

        if (Object.keys(state.pendingWins).length > 0) {
          state.checkWinEffects(n);
        }
      }

      frameId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handlePlaceBet = (cell: CellData, canBet: boolean) => {
    if (canBet) {
      if (betAmount > balance) {
        toast.error("Insufficient balance!");
        return;
      }
      placeBet(cell.id, betAmount);
    }
  };

  // Measure container dimensions
  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;
    
    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions((prev) =>
          prev.width !== rect.width || prev.height !== rect.height
            ? { width: rect.width, height: rect.height }
            : prev
        );
      }
    };

    // Measure immediately and on every frame for the first second
    measure();
    const immediateInterval = setInterval(measure, 100);
    setTimeout(() => clearInterval(immediateInterval), 2000);

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 50);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearInterval(immediateInterval);
      clearTimeout(resizeTimer);
    };
  }, []);

  if (cells.length === 0) return null;

  const isMobile = dimensions.width < 500;
  const pastSpanMs = 15000;
  const futureSpanMs = isMobile ? 25000 : 35000;
  const timeSpanMs = pastSpanMs + futureSpanMs;

  const firstTime = now - pastSpanMs;
  const lastTime = now + futureSpanMs;

  const priceSpan = 9;
  const maxPrice = cameraPrice + 4.5 * modePriceStep;
  const minPrice = cameraPrice - 4.5 * modePriceStep;
  const totalPriceSpan = maxPrice - minPrice;

  // Horizontal price levels
  const priceLevels: number[] = [];
  const startLevelIdx = Math.floor((minPrice - basePrice) / modePriceStep) - 1;
  const endLevelIdx = Math.ceil((maxPrice - basePrice) / modePriceStep) + 1;
  for (let i = startLevelIdx; i <= endLevelIdx; i++) {
    priceLevels.push(basePrice + i * modePriceStep);
  }

  // Position helpers (percentage)
  const getTimeX = (t: number) => ((t - firstTime) / timeSpanMs) * 100;
  const getPriceY = (p: number) => ((maxPrice - p) / totalPriceSpan) * 100;

  const rowHeight = 100 / priceSpan;
  const colWidth = ((modeIntervalSeconds * 1000) / timeSpanMs) * 100;

  const getSvgPath = () => {
    if (history.length === 0 || dimensions.width === 0) return "";
    return history
      .map((pt, i) => {
        const x = (getTimeX(pt.time) * dimensions.width) / 100;
        const y = (getPriceY(pt.price) * dimensions.height) / 100;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const lPt = history.length > 0 && dimensions.width > 0
    ? {
        x: (getTimeX(history[history.length - 1].time) * dimensions.width) / 100,
        y: (getPriceY(history[history.length - 1].price) * dimensions.height) / 100,
      }
    : null;

  const timeLabels: number[] = [];
  const labelInterval = 10000;
  let tLabel = Math.floor(firstTime / labelInterval) * labelInterval;
  while (tLabel <= lastTime + labelInterval) {
    if (tLabel >= firstTime && tLabel <= lastTime) timeLabels.push(tLabel);
    tLabel += labelInterval;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '4px',
        fontFamily: 'monospace',
        overflow: 'hidden',
      }}
    >
      {/* Y-axis price labels */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: '4px',
          bottom: '24px',
          width: '48px',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {priceLevels.map((p) => {
          const top = getPriceY(p);
          if (top < -10 || top > 110) return null;
          return (
            <div
              key={`y_${p}`}
              style={{
                position: 'absolute',
                width: '100%',
                top: `${top}%`,
                right: 0,
                transform: 'translateY(-50%)',
                fontSize: '9px',
                fontWeight: 700,
                color: '#d1d5db',
                pointerEvents: 'none',
              }}
            >
              <span style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)' }}>
                ${p.toFixed(0)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main chart area */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
          marginRight: '48px',
          background: '#080A0C',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '4px',
        }}
      >
        {/* Horizontal grid lines */}
        {priceLevels.map((p) => {
          const lineTop = getPriceY(p);
          if (lineTop < -10 || lineTop > 110) return null;
          return (
            <div
              key={`hx_${p}`}
              style={{
                position: 'absolute',
                width: '100%',
                height: '1px',
                background: 'rgba(255,255,255,0.05)',
                top: `${lineTop}%`,
              }}
            />
          );
        })}

        {/* Vertical time grid lines */}
        {timeLabels.map((t) => (
          <div
            key={`vx_${t}`}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '1px',
              background: 'rgba(255,255,255,0.05)',
              left: `${getTimeX(t)}%`,
            }}
          />
        ))}

        {/* "Now" line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '1px',
            zIndex: 20,
            background: 'rgba(59,130,246,0.4)',
            left: `${getTimeX(now)}%`,
          }}
        />

        {/* Grid cells */}
        {cells.map((cell) => {
          if (cell.timeWindowEnd < firstTime || cell.timeWindowStart > lastTime) return null;

          const isPast = now >= cell.timeWindowEnd;
          const isHit = cell.status === "hit";
          const betAmountVal = bets[cell.id] || 0;
          const pendingBetAmountVal = pendingBets[cell.id] || 0;
          const hasBet = betAmountVal > 0;
          const isPending = pendingBetAmountVal > 0;
          const hasAnyBet = hasBet || isPending;
          const displayBetAmount = hasBet ? betAmountVal : pendingBetAmountVal;

          if (now >= cell.timeWindowStart && !hasAnyBet) return null;
          if (isPast && !isHit && !pendingWins[cell.id]) return null;

          const left = getTimeX(cell.timeWindowStart);
          const top = getPriceY(cell.priceLevel + modePriceStep / 2);
          const isFuture = cell.timeWindowStart > now;
          const isNext = isFuture && cell.timeWindowStart - now <= 5000;
          const canBet = isFuture && !isNext && !hasAnyBet;

          let bgColor: string | undefined;
          let boxShadow: string | undefined;
          let outline: string | undefined;
          let textColor = '#888';
          let opacity = 1;

          if (isHit && hasAnyBet) {
            bgColor = 'rgba(46,189,133,0.35)';
            boxShadow = 'inset 0 0 10px rgba(46,189,133,0.35)';
            outline = '1px solid #2EBD85';
            textColor = '#2EBD85';
          } else if (!isPast && hasAnyBet) {
            bgColor = 'rgba(8, 71, 247, 0.35)';
            outline = '1px solid #0847F7';
            textColor = '#0847F7';
          } else if (isNext && !hasAnyBet) {
            bgColor = 'rgba(246,70,93,0.06)';
            textColor = '#F6465D';
            opacity = 0.3;
          }

          return (
            <motion.div
              whileHover={canBet ? { scale: 0.95, backgroundColor: "rgba(255,255,255,0.1)" } : {}}
              whileTap={canBet ? { scale: 0.9 } : {}}
              key={cell.id}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `${top}%`,
                width: `${colWidth}%`,
                height: `${rowHeight}%`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                cursor: canBet ? 'pointer' : isNext ? 'not-allowed' : 'default',
                borderWidth: '0.5px',
                borderStyle: 'solid',
                borderColor: 'rgba(255, 255, 255, 0.05)',
                background: bgColor,
                boxShadow,
                outline,
                opacity,
                zIndex: (isHit && hasAnyBet) ? 20 : (!isPast && hasAnyBet) ? 10 : 1,
                transition: 'all 0.3s',
              }}
              onClick={() => handlePlaceBet(cell, canBet)}
            >
              <div style={{ color: textColor, fontWeight: cell.multiplier >= 10 ? 800 : 500 }}>
                {cell.multiplier.toFixed(2)}x
              </div>
              {hasAnyBet && !isHit && (
                <div style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 6px',
                  borderRadius: '4px', background: '#2563eb', color: '#fff',
                  marginTop: '4px', boxShadow: '0 4px 6px rgba(37,99,235,0.5)',
                }}>
                  ${displayBetAmount}
                </div>
              )}
              {isHit && hasAnyBet && (
                <div style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 6px',
                  borderRadius: '4px', background: '#22c55e', color: '#fff',
                  marginTop: '4px', boxShadow: '0 4px 6px rgba(34,197,94,0.5)',
                }}>
                  +${displayBetAmount * cell.multiplier!}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Horizontal CameraPrice Line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '1px',
            zIndex: 25,
            background: 'linear-gradient(to right, transparent, #3b82f6 50%, transparent)',
            top: `${getPriceY(cameraPrice)}%`,
            pointerEvents: 'none',
            boxShadow: '0 0 8px rgba(59,130,246,0.8)',
          }}
        />

        {/* SVG price line */}
        {history.length > 0 && dimensions.width > 0 && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 30,
            }}
          >
            <path d={getSvgPath()} fill="none" stroke="#8AA6F9" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {lPt && <circle cx={lPt.x} cy={lPt.y} r="3.5" fill="#0847F7" />}
          </svg>
        )}
      </div>

      {/* X-axis time labels */}
      <div
        style={{
          height: '20px',
          flexShrink: 0,
          position: 'relative',
          marginRight: '48px',
          overflow: 'hidden',
          fontSize: '9px',
          fontWeight: 700,
          color: '#d1d5db',
          marginTop: '2px',
        }}
      >
        {timeLabels.map((t) => (
          <div
            key={`tx_${t}`}
            style={{
              position: 'absolute',
              left: `${getTimeX(t)}%`,
              transform: 'translateX(-50%)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <span style={{ background: '#080A0C', padding: '0 4px' }}>
              {format(new Date(t), "HH:mm:ss")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
