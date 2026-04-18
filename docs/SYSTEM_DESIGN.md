# System Design Document

## MiniTap — BTC Tap-Trading Platform

**Version:** 1.0
**Date:** April 18, 2026
**Organization:** MiniTap

---

## 1. System Overview

MiniTap is a three-tier architecture combining a real-time trading frontend, a NestJS backend with event-driven workers, and a Celo smart contract layer for onchain verification and settlement.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           USER DEVICE (MiniPay)                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Frontend (Vite + React + TypeScript)                                │  │
│  │  • Auto-connect wallet  • Trading UI  • Price chart  • Verification │  │
│  └──────────┬────────────────────────────────────┬──────────────────────┘  │
│             │ REST / WebSocket                   │ Wagmi + Viem (RPC)     │
└─────────────┼────────────────────────────────────┼────────────────────────┘
              │                                    │
              ▼                                    ▼
┌─────────────────────────────┐    ┌──────────────────────────────────────┐
│    Backend (NestJS)          │    │    Celo Blockchain                    │
│                              │    │                                      │
│  ┌──────────────────────┐    │    │  ┌──────────────────────────────┐    │
│  │ API Server (port 3001)│   │    │  │ Smart Contracts               │    │
│  │ • Auth/Account        │   │    │  │ • PriceIntegrity.sol          │    │
│  │ • Order               │   │    │  │ • Settlement.sol              │    │
│  │ • Payment             │   │    │  │ • PoolReserve.sol             │    │
│  │ • Price               │   │    │  │ • LPDistributor.sol           │    │
│  │ • Risk                │   │    │  │ • StrategyManager.sol         │    │
│  │ • Settlement          │   │    │  │ • Roles.sol                   │    │
│  │ • Socket Gateway      │   │    │  └──────────────────────────────┘    │
│  └──────────┬────────────┘   │    │                                      │
│             │                │    │  Celo Backend Worker submits          │
│  ┌──────────▼────────────┐   │    │  verification & settlement txs       │
│  │ Worker (port 3002)     │  │    │  directly to Celo contracts           │
│  │ • Event Indexer        │  │    │                                      │
│  │ • Settlement Batcher   │  │    └──────────────────────────────────────┘
│  │ • Blockchain Listener  │  │
│  └───────────────────────┘   │
│                              │
└──────────────┬───────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌────────┐ ┌───────┐ ┌───────┐
│Postgres│ │ Redis │ │ MinIO │
│        │ │       │ │       │
└────────┘ └───────┘ └───────┘
```

---

## 2. Architecture Components

### 2.1 Frontend (MiniPay Mini App)

| Attribute | Value |
|-----------|-------|
| Framework | Vite + React + TypeScript |
| Wallet | Wagmi v3 + Viem, injected connector |
| Chains | Celo Mainnet + Celo Sepolia |
| Realtime | WebSocket via Socket.io |
| API client | Orval-generated TypeScript client (from Swagger) |
| Deployment | Vercel |

**Key responsibilities:**
- Auto-connect to MiniPay wallet on load
- Display real-time BTC price chart with 5-second trading windows
- Execute trade (UP/DOWN) via REST API call to backend
- Show trade results, balances, and history
- Read onchain verification data (Price Integrity, Settlement, Pool Reserve) via Wagmi/Viem from Celo

**Module structure:**
```
frontend/
├── docs/                    # Design and requirement docs
├── src/
│   ├── components/          # UI components
│   ├── hooks/               # useAutoConnect, useWallet, etc.
│   ├── lib/                 # Wagmi config, contract ABIs
│   ├── pages/ or routes/    # App pages
│   └── api/                 # Orval-generated API client
├── swagger.json             # Backend API schema
├── orval.config.ts          # API client generation config
└── vite.config.ts
```

---

### 2.2 Backend (NestJS Application)

| Attribute | Value |
|-----------|-------|
| Framework | NestJS (TypeScript) |
| Database | PostgreSQL (migrations via TypeORM) |
| Cache | Redis |
| Object Storage | MinIO |
| Message Queue | Kafka (optional, for event-driven flows) |
| Blockchain | Ether.js with typechain-generated bindings on Celo |
| Processes | Main API (port 3001) + Worker (port 3002) |

**Domain modules:**

```
src/modules/
├── auth/           # Wallet-based authentication
├── account/        # User accounts and profiles
├── order/          # Trade order management
├── settlement/     # Batch settlement logic
├── payment/        # Deposits and withdrawals
├── distribution/   # LP reward distribution
├── price/          # Price feed management
├── risk/           # Risk scoring and limits
├── strategy/       # LP allocation strategies
├── socket/         # WebSocket gateway for realtime
└── worker/         # Background jobs and indexers
```

**Key responsibilities:**
- Manage user accounts, orders, and balances
- Match and resolve trades in 5-second windows (offchain)
- Batch settled trades every 15 minutes for onchain commitment
- Submit settlement batches to Celo smart contracts via the Worker service
- Index onchain events emitted by Celo smart contracts
- Push realtime updates via WebSocket

---

### 2.3 Smart Contracts (Foundry / Solidity on Celo)

Deployed on **Celo Sepolia** (PoC). Contract addresses:

| Contract | Address | Purpose |
|----------|---------|---------|
| Roles | `0x23B8...055d` | Access control for authorized submitters |
| PriceIntegrity | `0x6043...50de` | Stores 15-min OHLC verification scores |
| PoolReserve | `0x0b74...5bAf` | Pool balance and solvency reports |
| Settlement | `0xEDD3...5050` | Batch settlement roots and totals |
| StrategyManager | `0x1CB5...4616` | LP allocation parameters |
| Asset (USDT) | `0x7798...4789` | ERC-20 token used for trading |

**Contract hierarchy:**
```
                    Roles.sol
                   (access control)
                        │
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
  PriceIntegrity  Settlement.sol  PoolReserve.sol
      .sol                          │
                                    ▼
                              LPDistributor.sol
                                    │
                                    ▼
                              StrategyManager.sol
```

Each consumer contract uses `Roles.sol` to restrict write access to authorized backend worker addresses only.

---

### 2.4 Onchain Verification Workflows

Five verification processes running on the Backend Worker, submitting results to Celo smart contracts:

| Workflow | Trigger | Frequency | Input | Output Contract |
|----------|---------|-----------|-------|-----------------|
| **Price Integrity** | Cron | Every 15 min | App internal 1s OHLC + external reference data | `PriceIntegrity.sol` |
| **Settlement** | Cron | Every 15 min | Pending settlement batch from order module | `Settlement.sol` |
| **Pool Solvency** | Cron | Daily | Pool reserve state + onchain token balances | `PoolReserve.sol` |
| **Strategy Rebalance** | Manual / API | On demand | Strategy parameters from strategy module | `StrategyManager.sol` |
| **LP Distribution** | Cron | Periodic | LP share calculations | `LPDistributor.sol` |

**Verification execution pattern:**
```
[Trigger: Cron / API call]
       │
       ▼
[Worker fetches data from internal modules]
       │
       ▼
[Worker fetches external reference price data]
       │
       ▼
[Deterministic computation & validation]
       │
       ▼
[Worker submits tx to Celo smart contract]
       │
       ▼
[Contract validates & stores result, emits events]
       │
       ▼
[Worker indexes events for frontend display]
```

---

## 3. Data Flows

### 3.1 Trade Lifecycle

```
User taps UP/DOWN
       │
       ▼
Frontend → REST POST /order → Backend
       │
       ▼
Backend resolves trade at window close (offchain, 5s)
       │
       ▼
Trade result pushed via WebSocket to Frontend
       │
       ▼
Trade queued in settlement batch
       │
       ▼ (every 15 minutes)
Backend Worker Settlement Process:
  1. Collects all resolved trades in the 15-min window
  2. Canonicalizes records, computes merkle root
  3. Calls Settlement.sol.commitSettlementBatch(
       batchId, merkleRoot, totalPayout,
       withdrawableCap, windowStart, windowEnd
     ) on Celo
       │
       ▼
Settlement.sol emits SettlementBatchCommitted event
       │
       ▼
Backend Worker indexes event → marks batch as onchain-confirmed
```

### 3.2 Price Integrity Verification

```
Every 15 minutes:
       │
       ▼
Backend Worker Price Integrity Process:
  1. Fetch internal 1s OHLC batch from price module
  2. Fetch reference 1s OHLC from external price feeds
  3. Canonicalize, compute deviation, score
  4. Submit batch report to PriceIntegrity.sol on Celo
       │
       ▼
PriceIntegrity.sol emits:
  • PriceIntegrityBatchReported
  • BatchSubmitted
       │
       ▼
Backend Worker indexes events
       │
       ▼
Frontend reads latest score via Wagmi / displays in dashboard
```

### 3.3 Pool Solvency Proof

```
Daily:
       │
       ▼
Backend Worker Pool Solvency Process:
  1. Read PoolReserve.sol onchain state (total deposits, liabilities)
  2. Read ERC-20 asset balance of pool contract on Celo
  3. Compute solvency ratio
  4. Submit report to PoolReserve.sol on Celo
       │
       ▼
PoolReserve.sol emits solvency event
       │
       ▼
Frontend displays: "Pool is 103% solvent ✓"
```

---

## 4. Database Schema (High Level)

```
┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
│   accounts   │   │    orders     │   │  settlements     │
├──────────────┤   ├──────────────┤   ├──────────────────┤
│ id           │   │ id           │   │ id               │
│ address      │──→│ account_id   │   │ batch_id         │
│ created_at   │   │ direction    │   │ merkle_root      │
│ balance      │   │ amount       │   │ total_payout     │
└──────────────┘   │ window_start │   │ window_start     │
                   │ window_end   │   │ window_end       │
                   │ result       │   │ tx_hash          │
                   │ payout       │   │ status           │
                   │ settled_at   │   └──────────────────┘
                   │ batch_id     │
                   └──────────────┘

┌──────────────┐   ┌──────────────────┐
│  payments    │   │ price_integrity  │
├──────────────┤   ├──────────────────┤
│ id           │   │ id               │
│ account_id   │   │ batch_timestamp  │
│ type         │   │ score            │
│ amount       │   │ deviation        │
│ tx_hash      │   │ tx_hash          │
│ status       │   │ flags            │
└──────────────┘   └──────────────────┘
```

---

## 5. API Design

### 5.1 REST API (Backend → Frontend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/connect` | Register/authenticate wallet address |
| GET | `/account/me` | Get current user profile and balance |
| POST | `/order` | Place a trade (UP/DOWN) |
| GET | `/order/history` | Get trade history with pagination |
| GET | `/order/active` | Get active (unresolved) trades |
| POST | `/payment/deposit` | Initiate USDT deposit |
| POST | `/payment/withdraw` | Request withdrawal |
| GET | `/payment/history` | Payment history |
| GET | `/settlement/batches` | List settlement batches |
| GET | `/price/current` | Current BTC/USDT price |
| GET | `/pool/status` | Pool reserve and solvency data |

### 5.2 WebSocket Events (Backend → Frontend)

| Event | Payload | Direction |
|-------|---------|-----------|
| `price:update` | `{ price, timestamp }` | Server → Client |
| `window:start` | `{ windowId, startTime, endTime }` | Server → Client |
| `window:close` | `{ windowId, closePrice }` | Server → Client |
| `order:result` | `{ orderId, result, payout }` | Server → Client |
| `balance:update` | `{ balance }` | Server → Client |

### 5.3 Internal Worker API (Backend modules → Worker)

| Process | Source | Description |
|---------|--------|-------------|
| Price Integrity | Price module | 15-min internal OHLC data |
| Settlement | Order module | Pending settlement batch |
| Pool Solvency | Payment module | Current pool state for solvency check |
| Strategy | Strategy module | Active strategy parameters |

---

## 6. Infrastructure

### 6.1 Current PoC Infrastructure

```
┌─────────────────────────────────────────────────┐
│                  Docker Compose                  │
│                                                  │
│  ┌───────────┐  ┌───────┐  ┌───────┐  ┌──────┐ │
│  │ PostgreSQL│  │ Redis │  │ MinIO │  │ Kafka│ │
│  │ :5432     │  │ :6379 │  │ :32126│  │:39092│ │
│  └───────────┘  └───────┘  └───────┘  └──────┘ │
└─────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ NestJS API   │  │ NestJS Worker│  │ Frontend     │
│ :3001        │  │ :3002        │  │ Vercel       │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────────────────────────────────────────┐
│           Celo Sepolia Testnet                    │
│  • Smart contracts deployed                      │
│  • Worker submits verification txs               │
└──────────────────────────────────────────────────┘
```

### 6.2 Production Target

| Component | Service | Notes |
|-----------|---------|-------|
| Frontend | Vercel | Edge CDN, auto-deploy from `main` |
| Backend API | AWS ECS / GCP Cloud Run | Containerized NestJS |
| Worker | AWS ECS / GCP Cloud Run | Separate task definition |
| Database | AWS RDS / GCP Cloud SQL | PostgreSQL managed |
| Cache | AWS ElastiCache / GCP Memorystore | Redis managed |
| Object Storage | AWS S3 / GCP GCS | Replace MinIO |
| Blockchain | Celo Mainnet | Via public/private RPC |

---

## 7. Security Considerations

### 7.1 Smart Contract Security

| Measure | Implementation |
|---------|---------------|
| Access control | `Roles.sol` restricts authorized submitter and admin operations |
| Input validation | Contracts validate batch IDs, roots, and amounts on every call |
| Pausable | Critical contracts can be paused on anomaly detection |
| Immutable settlement | Committed batches cannot be retrospectively altered |

### 7.2 Backend Security

| Measure | Implementation |
|---------|---------------|
| Auth | JWT-based after wallet connection via Privy |
| Input validation | Zod/class-validator on all endpoints |
| Rate limiting | Per-address rate limits on trade and payment endpoints |
| Secrets management | Environment variables, never in VITE_* |
| Private key isolation | `ADMIN_PRIVATE_KEY` used only by backend worker, never exposed |

### 7.3 Frontend Security

| Measure | Implementation |
|---------|---------------|
| No private keys | All signing done by MiniPay |
| No secrets in bundle | Only VITE_* public config |
| Input validation | Client-side validation before API calls |
| Error handling | Error boundaries, no raw error display |

---

## 8. Monitoring & Observability

| Layer | Tool | What to monitor |
|-------|------|-----------------|
| Frontend | Vercel Analytics | Load time, error rate, Web Vitals |
| Backend | Prometheus + Grafana | Request latency, error rate, DB connections |
| Worker | Structured logging | Event indexing lag, batch processing time |
| Smart Contracts | CeloScan + custom indexer | Event emissions, gas usage, revert rates |

### Key Alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| Settlement delay | No batch committed in 20 minutes | High |
| Price integrity failure | Score < 80% on any batch | Critical |
| Pool insolvency | Solvency ratio < 100% | Critical |
| Backend error spike | 5xx rate > 1% for 5 minutes | High |
| WebSocket disconnection rate | > 20% clients disconnect in 1 minute | Medium |

---

## 9. Scalability Considerations

### Current (PoC)
- Single API instance + single Worker
- PostgreSQL handles 100–500 concurrent users
- WebSocket on same process

### Growth Path
- **Horizontal scaling**: Stateless API behind load balancer; Worker scaled by Kafka partitions
- **Database**: Read replicas for query-heavy endpoints; eventual CQRS for order history
- **WebSocket**: Separate Socket.io cluster with Redis adapter for cross-instance pub/sub
- **Price feed**: Dedicated price service caching upstream feeds; broadcast via Redis pub/sub
- **Settlement batching**: Could reduce to 5-minute intervals as Celo throughput allows

---

## 10. Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Vite, React, TypeScript, Wagmi v3, Viem, Socket.io-client |
| Backend | NestJS, TypeScript, TypeORM, Ether.js, Typechain |
| Database | PostgreSQL |
| Cache | Redis |
| Queue | Kafka |
| Storage | MinIO (PoC) → S3/GCS (prod) |
| Smart Contracts | Solidity, Foundry |
| Blockchain | Celo (EVM-compatible), Celo Sepolia testnet |
| CI/CD | GitHub Actions |
| Frontend Hosting | Vercel |
| Container Runtime | Docker + Docker Compose |

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| **Celo** | EVM-compatible Layer 1 blockchain optimized for mobile payments |
| **MiniPay** | Mobile wallet by Opera/Celo with built-in Mini App browser |
| **Tap-trading** | Binary price prediction within short time windows |
| **Grid band** | Fixed price increment ($20) used for trade resolution |
| **Settlement batch** | A group of trades committed onchain every 15 minutes |
| **Merkle root** | Cryptographic hash of all trades in a batch; enables individual proof |
| **Solvency ratio** | Pool actual reserves ÷ total liabilities; must be ≥ 100% |
| **OHLC** | Open-High-Low-Close price data format |
| **Wagmi** | React hooks library for Ethereum/EVM wallet interactions |
| **Viem** | TypeScript library for low-level EVM interactions |

---

## 12. References

- [Celo Developer Documentation](https://docs.celo.org)
- [MiniPay Developer Documentation](https://docs.minipay.xyz)
