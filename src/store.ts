import { create } from "zustand";
import toast from "react-hot-toast";

export interface PricePoint {
  time: number; // timestamp
  price: number;
}

export interface RemoteCell {
  gridTs: number;
  startTs: number;
  endTs: number;
  lowerPrice: string;
  upperPrice: string;
  rewardRate: string;
  gridSignature: string;
}

export interface CellData {
  id: string;
  timeWindowStart: number;
  timeWindowEnd: number;
  priceLevel: number; // The price band (e.g. 50020, 50040)
  multiplier: number;
  status: "active" | "past" | "hit";
  original: RemoteCell;
}

interface GameState {
  balance: number;
  serverBalance: number;
  currentPrice: number;
  history: PricePoint[];
  cells: CellData[];
  basePrice: number;
  modeIntervalSeconds: number;
  modePriceStep: number;
  bets: Record<string, number>;
  pendingBets: Record<string, number>;
  pendingWins: Record<string, number>;
  serverTimeOffset: number;
  betAmount: number;

  updatePrice: (price: number) => void;
  placeBet: (cellId: string, amount: number) => void;
  ensureCells: () => void;
  tickTime: () => void;
  checkWinEffects: (now: number) => void;
  setBetAmount: (amount: number) => void;
}

// Generate deterministic local mock cells
const generateMockCells = (basePrice: number, modePriceStep: number, modeIntervalSeconds: number, startTsCenter: number) => {
  const newCells: CellData[] = [];
  const startInterval = Math.floor(startTsCenter / (modeIntervalSeconds * 1000)) * (modeIntervalSeconds * 1000);
  
  // Generate 20 intervals into future
  for(let i=0; i<15; i++) {
    const startTs = startInterval + (i * modeIntervalSeconds * 1000);
    const endTs = startTs + (modeIntervalSeconds * 1000);
    
    // Generate 12 price levels
    for(let j=-6; j<=6; j++) {
      const priceLevel = basePrice + (j * modePriceStep);
      const lowerPrice = priceLevel - (modePriceStep / 2);
      const upperPrice = priceLevel + (modePriceStep / 2);
      
      const id = `${startTs}:${endTs}:${lowerPrice}:${upperPrice}`;
      
      const distFromCenter = Math.abs(j);
      let multiplier = 1.8;
      if (distFromCenter === 0) multiplier = 1.5;
      else if (distFromCenter === 1) multiplier = 1.8;
      else if (distFromCenter === 2) multiplier = 3.5;
      else if (distFromCenter === 3) multiplier = 8.0;
      else if (distFromCenter === 4) multiplier = 25.0;
      else multiplier = 100.0 + (distFromCenter * 50);

      newCells.push({
        id,
        timeWindowStart: startTs,
        timeWindowEnd: endTs,
        priceLevel,
        multiplier,
        status: "active",
        original: {
          gridTs: startTs,
          startTs,
          endTs,
          lowerPrice: lowerPrice.toString(),
          upperPrice: upperPrice.toString(),
          rewardRate: multiplier.toString(),
          gridSignature: "mock_sig"
        }
      });
    }
  }
  return newCells;
}

export const useGameStore = create<GameState>((set) => ({
  balance: 100, // Demo starting balance
  serverBalance: 100,
  currentPrice: 64250,
  history: [], 
  cells: [],
  basePrice: 64250, // Anchor point for the grid
  modeIntervalSeconds: 5,
  modePriceStep: 20, // $20 bands
  bets: {},
  pendingBets: {},
  pendingWins: {},
  betAmount: 10,
  serverTimeOffset: 0,

  setBetAmount: (amount) => set({ betAmount: amount }),

  checkWinEffects: (now: number) =>
    set((state) => {
      let changed = false;
      const newState = { ...state };
      const newPendingWins = { ...state.pendingWins };

      for (const [cellId, winAmount] of Object.entries(state.pendingWins)) {
        const cell = newState.cells.find((c) => c.id === cellId);
        if (!cell) {
          delete newPendingWins[cellId];
          changed = true;
          continue;
        }

        const lowerPrice = cell.priceLevel - newState.modePriceStep / 2;
        const upperPrice = cell.priceLevel + newState.modePriceStep / 2;

        const isTimeInside = now >= cell.timeWindowStart && now <= cell.timeWindowEnd;
        const isTimePassed = now > cell.timeWindowEnd;
        const isPriceInside = newState.currentPrice >= lowerPrice && newState.currentPrice <= upperPrice;
        const isTouching = isTimeInside && isPriceInside;

        if (cell.status !== "hit" && (isTouching || isTimePassed)) {
          if (winAmount > 0) {
            toast.success(`You won $${winAmount.toFixed(2)}! 🚀`, {
              style: {
                background: "#252422",
                color: "#2EBD85",
                border: "1px solid rgba(46, 189, 133, 0.5)",
              },
            });
          }

          newState.cells = newState.cells.map((c) =>
            c.id === cellId ? { ...c, status: "hit" as const } : c,
          );

          delete newPendingWins[cellId];
          changed = true;
        }
      }

      if (changed) {
        newState.pendingWins = newPendingWins;
        newState.balance = newState.serverBalance - Object.values(newPendingWins).reduce((a, b) => a + b, 0);
        return newState;
      }
      return state;
    }),

  updatePrice: (price) =>
    set((state) => {
      const now = Date.now();
      const newHistory = [...state.history, { time: now, price }].filter(
        (p) => now - p.time <= 60000,
      );
      
      // Simulate backend resolution check immediately when price updates
      let newState = { ...state, currentPrice: price, history: newHistory };
      const newPendingWins = { ...newState.pendingWins };
      const newBets = { ...newState.bets };
      const newPendingBets = { ...newState.pendingBets };
      
      // Resolve pending bets seamlessly
      for (const [cellId, amount] of Object.entries(newPendingBets)) {
          const cell = newState.cells.find(c => c.id === cellId);
          if (cell) {
             const isTimeInside = now >= cell.timeWindowStart && now <= cell.timeWindowEnd;
             const isTimePassed = now > cell.timeWindowEnd;
             const lowerPrice = cell.priceLevel - newState.modePriceStep / 2;
             const upperPrice = cell.priceLevel + newState.modePriceStep / 2;
             
             if (isTimeInside && price >= lowerPrice && price <= upperPrice) {
                 // Hit!
                 newPendingWins[cellId] = amount * cell.multiplier;
                 newBets[cellId] = amount;
                 delete newPendingBets[cellId];
             } else if (isTimePassed) {
                 // Missed
                 newBets[cellId] = amount;
                 delete newPendingBets[cellId];
             }
          }
      }
      
      return { 
          ...newState,
          bets: newBets,
          pendingBets: newPendingBets,
          pendingWins: newPendingWins
      };
    }),

  placeBet: (cellId, amount) =>
    set((state) => {
      if (state.bets[cellId] || state.pendingBets[cellId]) {
        return state;
      }
      if (state.balance >= amount) {
        return {
          serverBalance: state.serverBalance - amount,
          balance: state.balance - amount,
          pendingBets: { ...state.pendingBets, [cellId]: amount },
        };
      }

      toast.error("Insufficient balance!");
      return state;
    }),

  ensureCells: () => {
    set((state) => {
      if (state.cells.length === 0) {
          const cells = generateMockCells(state.basePrice, state.modePriceStep, state.modeIntervalSeconds, Date.now());
          return { cells };
      }
      return state;
    })
  },

  tickTime: () =>
    set((state) => {
      const now = Date.now();
      const cutoff = now - 60000;

      // Add new cells as time progresses
      let cells = [...state.cells];
      const maxTimeWindow = cells.length > 0 ? Math.max(...cells.map(c => c.timeWindowEnd)) : now;
      
      if (maxTimeWindow - now < 30000) {
          const moreCells = generateMockCells(state.basePrice, state.modePriceStep, state.modeIntervalSeconds, maxTimeWindow + 10000);
          
          for (const cell of moreCells) {
             if (!cells.find(c => c.id === cell.id)) cells.push(cell);
          }
      }

      cells = cells.filter((c) => c.timeWindowEnd > cutoff);
      cells = cells.map((cell) => {
        if (cell.status === "active" && now > cell.timeWindowEnd) {
          return { ...cell, status: "past" as const };
        }
        return cell;
      });

      return { cells };
    }),
}));
