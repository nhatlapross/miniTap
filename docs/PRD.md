# Product Requirements Document (PRD)

## MiniTap — BTC Tap-Trading on MiniPay

**Version:** 1.0
**Date:** April 18, 2026
**Organization:** MiniTap

---

## 1. Executive Summary

MiniTap is a **BTC tap-trading** MiniPay Mini App that lets users predict short-term Bitcoin price movements within 5-second windows using $20 grid bands. Users place quick "tap" trades — essentially binary predictions — and the platform handles resolution, settlement, and payouts.

The platform is **verifiably fair**: every price feed, settlement batch, and pool balance is cryptographically verified onchain through smart contracts deployed on the **Celo** blockchain. This gives users transparent proof that trades are settled using accurate prices and that the liquidity pool is solvent.

---

## 2. Problem Statement

Traditional prediction and micro-trading platforms suffer from:

- **Opaque price feeds** — users cannot verify the prices used for trade resolution
- **Hidden settlement logic** — payouts are computed offchain with no auditability
- **No solvency guarantees** — users trust the platform to hold sufficient reserves
- **Complex onboarding** — typical crypto apps require wallet setup, seed phrases, and bridge interactions

MiniTap solves these problems by:

1. Running inside **MiniPay**, which provides an injected wallet with zero setup
2. Using **Celo smart contracts** for independent, cryptographically signed verification of prices, settlements, pool solvency, and strategy parameters
3. Publishing all verification results **onchain** on Celo for anyone to audit

---

## 3. Target Users

| Persona | Description |
|---------|-------------|
| **Casual crypto users** | MiniPay users looking for quick, fun engagement with BTC price movements |
| **Micro-traders** | Users who want to make rapid predictions without managing complex order books |
| **Transparency seekers** | Users who value provable fairness and onchain verification |

### User Demographics
- Primary market: Sub-Saharan Africa and Southeast Asia (MiniPay's core user base)
- Mobile-first users with USDT/cUSD balances
- Users who deposit $5–$50 per session

---

## 4. Product Overview

### 4.1 Core Gameplay

| Parameter | Value |
|-----------|-------|
| Trading pair | BTC/USDT |
| Window duration | 5 seconds |
| Grid size | $20 bands |
| Min trade | TBD (design phase) |
| Settlement | Batch-committed every 15 minutes |
| Blockchain | Celo |

**Flow:**

1. User opens MiniTap in MiniPay → wallet auto-connects
2. User sees a live BTC price chart with 5-second countdown windows
3. User taps **UP** or **DOWN** to predict the next 5-second movement
4. Window closes; result is resolved offchain instantly
5. Every 15 minutes, a batch of all resolved trades is settled onchain via Celo smart contracts
6. Winnings are credited; users can withdraw anytime

### 4.2 Key Features

#### 4.2.1 Tap-Trading Interface
- Real-time BTC price chart (1-second OHLC)
- Visual countdown timer for 5-second windows
- One-tap UP/DOWN trade execution
- Instant win/loss visual feedback
- Trade history with outcome tracking

#### 4.2.2 Wallet & Balances
- Auto-connect via MiniPay injected provider (no connect button)
- Display USDT/cUSD/CELO balances
- Deposit flow via MiniPay Add Cash deeplink
- Withdrawal request with status tracking

#### 4.2.3 Onchain Verification Dashboard
- **Price Integrity** — view latest 15-min OHLC verification scores
- **Settlement Batches** — browse committed settlement roots and totals
- **Pool Solvency** — daily proof-of-reserve report
- **Strategy Parameters** — current LP allocation config
- All data pulled from onchain events with CeloScan links

#### 4.2.4 Liquidity Pool (LP)
- Users can provide liquidity to the trading pool
- LP distributions are managed via `LPDistributor.sol`
- Pool reserves are auditable via `PoolReserve.sol` solvency reports
- Strategy rebalancing adjusts allocations (managed by `StrategyManager.sol`)

---

## 5. Functional Requirements

### 5.1 Authentication & Accounts

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | Auto-connect wallet on page load (no connect button) | P0 |
| FR-1.2 | Display connected address and chain | P0 |
| FR-1.3 | Backend account creation on first connection | P0 |
| FR-1.4 | No message signing for access | P0 |

### 5.2 Trading

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | Display real-time BTC/USDT price with 1s updates | P0 |
| FR-2.2 | 5-second trading windows with countdown | P0 |
| FR-2.3 | One-tap UP/DOWN trade placement | P0 |
| FR-2.4 | Instant win/loss resolution display | P0 |
| FR-2.5 | Trade history with filtering | P1 |
| FR-2.6 | Active trade tracking | P0 |

### 5.3 Deposits & Withdrawals

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | Deposit USDT into trading balance | P0 |
| FR-3.2 | Withdrawal request with batch processing | P0 |
| FR-3.3 | Low balance → redirect to MiniPay Add Cash deeplink | P1 |
| FR-3.4 | Display pending and confirmed deposit/withdrawal status | P0 |

### 5.4 Onchain Verification

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | Display latest Price Integrity batch score | P1 |
| FR-4.2 | Browse settlement batch history with merkle roots | P1 |
| FR-4.3 | Show daily pool solvency report | P1 |
| FR-4.4 | Link all onchain records to CeloScan | P1 |

### 5.5 Liquidity Pool

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | Provide liquidity (deposit into pool) | P2 |
| FR-5.2 | Withdraw liquidity with proportional share | P2 |
| FR-5.3 | View LP reward distributions | P2 |
| FR-5.4 | View pool reserve breakdown | P2 |

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Page load time | < 2 seconds on 3G |
| NFR-2 | Price update latency | < 500ms WebSocket |
| NFR-3 | Trade placement latency | < 200ms to backend |
| NFR-4 | Mobile viewport | 360×640px minimum |
| NFR-5 | Uptime | 99.5% |
| NFR-6 | Settlement batch frequency | Every 15 minutes |
| NFR-7 | Price integrity check frequency | Every 15 minutes |
| NFR-8 | Solvency report frequency | Daily |

---

## 7. User Stories

### Epic 1: Onboarding
- **US-1.1** As a MiniPay user, I open MiniTap and my wallet connects automatically, so I can start trading immediately.
- **US-1.2** As a new user, I see a brief tutorial overlay explaining how tap-trading works.

### Epic 2: Trading
- **US-2.1** As a user, I see the current BTC price and a countdown timer, so I know when to place my trade.
- **US-2.2** As a user, I tap UP or DOWN before the window closes, and I instantly see my result.
- **US-2.3** As a user, I can view my trade history and filter by date, outcome, and amount.

### Epic 3: Wallet Management
- **US-3.1** As a user, I can deposit USDT to fund my trading balance.
- **US-3.2** As a user, I can withdraw my winnings at any time.
- **US-3.3** As a user with low balance, I am prompted to add funds via MiniPay.

### Epic 4: Verification & Trust
- **US-4.1** As a user, I can verify that the prices used for my trades match reference data recorded onchain on Celo.
- **US-4.2** As a user, I can see that my trade was included in an onchain settlement batch on Celo.
- **US-4.3** As a user, I can confirm the pool has sufficient reserves to pay all users.

---

## 8. Success Metrics

| Metric | Target (PoC) |
|--------|--------------|
| Daily Active Users (DAU) | 500+ |
| Avg. session duration | > 5 minutes |
| Trades per session | > 10 |
| Settlement batch accuracy | 100% (onchain verified) |
| Price integrity score | ≥ 95% on all batches |
| Pool solvency ratio | ≥ 100% at all times |

---

## 9. MiniPay Integration Requirements

| Requirement | Implementation |
|-------------|---------------|
| Auto-connect | `useAutoConnect` hook on page load |
| No connect button | Never render a manual connect UI |
| No message signing | Access is free; no sign-in-with-Ethereum |
| Touch targets | Minimum 44×44px for all buttons |
| Viewport | Works at 360×640px minimum |
| Single column | No horizontal scrolling |
| Error boundaries | Graceful fallback on any component crash |
| Loading states | Spinner/skeleton for all async operations |
| Dark/light mode | CSS `prefers-color-scheme` support |

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Celo network congestion | Settlements delayed | Queue-based retry + alerting; offchain trades unaffected |
| Price feed deviation | Unfair trade resolution | PriceIntegrity.sol flags anomalies; auto-pause if score < threshold |
| Pool insolvency | Users can't withdraw | Daily PoolReserve solvency check; auto-pause deposits if ratio < 100% |
| High latency on mobile | Poor UX | Optimize bundle size; use WebSocket for price; preload critical assets |
| MiniPay WebView quirks | Layout/interaction bugs | Test on MiniPay Developer Mode; follow UI container guidelines |

---

## 11. Release Plan

| Phase | Scope | Timeline |
|-------|-------|----------|
| **PoC (current)** | Basic tap-trading, onchain settlement on Celo Sepolia testnet | Hackathon |
| **Alpha** | Full trading UI, deposit/withdraw, price integrity dashboard | +4 weeks |
| **Beta** | LP features, strategy display, Celo mainnet deployment | +8 weeks |
| **GA** | MiniPay Discover listing, monitoring, rate limiting | +12 weeks |

---

## 12. References

- [Celo Developer Documentation](https://docs.celo.org)
- [MiniPay Developer Docs](https://docs.minipay.xyz)
