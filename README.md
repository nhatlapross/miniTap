# 🚀 MiniTap: Celo BTC Tap-Trading 

MiniTap is a revolutionary **BTC tap-trading** Web3 Mini App built specifically for the **Opera MiniPay** wallet ecosystem on the **Celo** blockchain. It allows users to place micro-predictions on Bitcoin's short-term price movements across dynamic grid bands in 5-second windows, gamifying the trading experience with highly interactive mechanics and onchain verifiable fairness.

---

## 🌟 Key Features

* **Instant MiniPay Wallet Connect**: Completely seamless onboarding. No manual wallet popups, no seed phrases, and no sign-in-with-Ethereum messages.
* **Interactive Tap Chart**: A dynamic, smoothly scrolling SVG/Grid hybrid tracking live mocked BTC prices.
* **One-Tap Betting**: Users tap directly on future grid cells to place their UP/DOWN predictions for that price band.
* **Vegas-Style Win Effects**: Instant visual feedback and confetti explosions when the price line hits a winning target.
* **Real-time Live Feed**: Simulated "toast" popups showing other users' winning trades, enhancing app gamification.
* **On-Chain Verifiability**: (Design Phase) Settlement logic, pool solvency, and cryptographic price integrity verification using Celo smart contracts.
* **Local Offline Simulation Loop**: High-performance local price generator ensuring the UI chart logic can be easily debugged and tested before real WebSockets are integrated.

---

## 🛠️ Tech Stack 

### Frontend (Mini App UI)
* **Framework**: React 19 + TypeScript + Vite 8
* **Styling**: Tailwind CSS v4 + Custom Glassmorphism 
* **Animations**: Framer Motion + Canvas Confetti
* **State Management**: Zustand (Local Game Store & Simulation Engine)
* **Web3 Integration**: Wagmi v3 + Viem

### Backend & Smart Contracts (Design & Integration Phase)
* **Backend**: NestJS, PostgreSQL, Redis
* **Blockchain**: Celo Mainnet / Sepolia
* **Smart Contracts**: Solidity / Foundry (`PriceIntegrity.sol`, `Settlement.sol`)

---

## ⚡ Running the Project Locally

To run the MiniTap frontend UI on your local machine:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **MiniPay Developer Mode Testing**
   To test the interface inside of the MiniPay wallet:
   - Expose your local port via Ngrok (e.g., `ngrok http 5173`).
   - Add your ngrok URL to the **allowedHosts** in `vite.config.ts`.
   - Open your MiniPay Developer tester app on mobile and enter the proxy address.

4. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📱 Mobile-First Architecture

MiniTap's UI has been aggressively optimized for mobile Safari and Android WebViews typically embedded inside MiniPay. 
* **No `flex-1` collapsing**: All grid cells use exact `calc()` dimensions and explicitly computed inline styles for the highest level of compatibility. 
* **SVG Optimization**: Hardware-accelerated SVG line drawing prevents DOM thrashing during 60FPS updates. 
* **Responsive Bottom Nav**: App layout actively leaves space for the sticky bottom mobile navigation.

---

## 🛡️ Provable Fairness (System Design)

Traditional binary options hide their settlement and price generation algorithms. MiniTap separates itself via:
- **Price Integrity**: Pushing 15-minute price snapshots (OHLC) to Celo contracts to verify feed fidelity.
- **Merkle Settlements**: Placing batch settlements to a Celo contract guaranteeing accurate payouts.
- **Proof-of-Reserves**: Daily onchain snapshots asserting the liquidity pool maintains 100%+ solvency at all times.

*(Detailed architecture can be found in `docs/SYSTEM_DESIGN.md`)*

---

*Note: The current iteration operates using a simulated logic loop for UI presentation. Connect feature and subsequent modules are part of the broader rollout plan as defined in `docs/PRD.md`.*
