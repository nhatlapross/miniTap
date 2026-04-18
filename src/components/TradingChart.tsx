import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  ReferenceLine
} from 'recharts';
import { Activity } from 'lucide-react';

export function TradingChart({ currentPrice }: { currentPrice: number }) {
  const [data, setData] = useState<{ time: number; price: number }[]>([
    { time: Date.now() - 5000, price: currentPrice - 5 },
    { time: Date.now() - 4000, price: currentPrice + 2 },
    { time: Date.now() - 3000, price: currentPrice - 1 },
    { time: Date.now() - 2000, price: currentPrice + 8 },
    { time: Date.now() - 1000, price: currentPrice + 3 },
    { time: Date.now(), price: currentPrice },
  ]);

  useEffect(() => {
    setData((prev) => {
      const newData = [...prev, { time: Date.now(), price: currentPrice }];
      if (newData.length > 20) {
        newData.shift(); // Keep last 20 ticks for smooth fast chart
      }
      return newData;
    });
  }, [currentPrice]);

  // Determine if it's going up or down recently
  const isUp = data.length > 1 && data[data.length - 1].price >= data[data.length - 2].price;
  const gradientColor = isUp ? '#34d399' : '#fb7185';
  
  // Calculate grid bands (nearest $20)
  const gridCenter = Math.round(currentPrice / 20) * 20;

  return (
    <div className="glass-panel" style={{ padding: '24px 16px', position: 'relative', overflow: 'hidden' }}>
      <div className="flex-row justify-between" style={{ marginBottom: '16px' }}>
        <div className="flex-row" style={{ gap: '8px' }}>
          <Activity size={20} className={isUp ? 'text-green' : 'text-red'} />
          <span className="section-title" style={{ margin: 0 }}>BTC/USDT</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="value-display" style={{ margin: 0, fontSize: '1.8rem', color: gradientColor }}>
            ${currentPrice.toFixed(2)}
          </div>
        </div>
      </div>

      <div style={{ height: '220px', width: '100%', marginLeft: '-20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis 
              domain={['dataMin - 10', 'dataMax + 10']} 
              hide={true} 
            />
            {/* $20 Grid Bands Simulation */}
            <ReferenceLine y={gridCenter + 20} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
            <ReferenceLine y={gridCenter} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
            <ReferenceLine y={gridCenter - 20} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
            
            <Area
              type="monotone"
              dataKey="price"
              stroke={gradientColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPrice)"
              isAnimationActive={false} // Disable to avoid weird jumping since we update very fast
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        position: 'absolute',
        top: '20px',
        right: '-30px',
        background: 'rgba(255,255,255,0.1)',
        padding: '4px 30px',
        transform: 'rotate(45deg)',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        letterSpacing: '1px'
      }}>
        LIVE
      </div>
    </div>
  );
}
