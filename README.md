# 📈 Stock Simulator — Paper Trading Platform

A full-stack **paper-trading** web app: practice buying and selling stocks with
virtual money, track a live portfolio with real-time profit/loss, and watch
prices move — all with **zero real-money risk**.

Built as a full-stack project covering a React frontend, a Node.js/Express REST
API, a PostgreSQL database, and WebSocket-based live price updates.

---

## ✨ Features

- **Paper trading** — buy/sell stocks from a ₹1,00,000 virtual balance, with
  balance checks and realized + unrealized **P&L** per position and account-wide.
- **Live market simulation** — a background service moves prices every few
  seconds and pushes updates to the browser over WebSockets. These live prices
  are the single source of truth for quotes, trade execution, and P&L.
- **Watchlist & dashboard** — track chosen stocks and see them, plus the day's
  market movers and your net return, on one dashboard.
- **Statistical anomaly detection** — a scheduled job flags accounts whose P&L
  is a statistical outlier (**Z-score > 2.5**), with an admin-only dashboard of
  flagged accounts, risk scores, and reasons.
- **Auth & roles** — email/password auth with **JWT** and **bcrypt**, plus
  user/admin role separation.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, React Router, TailwindCSS, Recharts, Lucide Icons |
| **Backend** | Node.js, Express, Socket.io |
| **Database** | PostgreSQL |
| **Auth** | JWT, bcrypt |

---

## 📸 Screenshots

**Dashboard** — watchlist, market movers, and portfolio summary
![Dashboard](./images/dashboard.png)

**Markets** — browse and search the stock universe
![Markets](./images/markets.png)

**Portfolio** — open positions with live P&L and trade history
![Portfolio](./images/portfolio.png)

**Order confirmation**
![Order placed](./images/order-success.png)

---

## 🏗️ Architecture

```
React (frontend)
   │  REST API   ─────────────►  Node.js / Express  ──►  PostgreSQL
   │  WebSockets ◄────────────►  Socket.io server
                                     │
                                     ├─ Price simulation service (live price ticks)
                                     └─ Anomaly detection job (flags outlier accounts)
```

Both background services run on timers inside the backend process (started in
`server.js`).

---

## 🚀 Run Locally

The backend connects to PostgreSQL via a single `DATABASE_URL` (works with
hosted Postgres like Supabase/Neon, or a local instance).

**1. Backend**
```bash
cd backend
npm install
# create backend/.env (see below), then:
node setup_db.js        # creates tables + seeds ~50 stocks
node create_admin.js    # optional: creates an admin (reads ADMIN_EMAIL/ADMIN_PASSWORD)
npm start               # http://localhost:5000
```

**2. Frontend**
```bash
cd frontend
npm install
npm start               # http://localhost:3000
```

**`backend/.env`**
```env
DATABASE_URL=postgresql://user:password@host:5432/stock_simulator
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**`frontend/.env`** (only needed if the API isn't on localhost:5000)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

> `.env` files stay local and gitignored — never commit real credentials.
