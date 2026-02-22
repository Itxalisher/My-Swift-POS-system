<<<<<<< HEAD
# ⚡ SwiftPay POS System

A full-stack Point of Sale app for small merchants — React frontend + Node.js/Express backend + SQLite database.

---

## 🚀 Quick Start (3 steps)

### Step 1 — Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Step 2 — Backend (optional — frontend works standalone)
```bash
cd backend
npm install
npm start
# API at http://localhost:3001
```

### Step 3 — Open in browser
Visit **http://localhost:5173** and log in:

| Role  | Username | Password  |
|-------|----------|-----------|
| 👑 Owner | `owner` | `owner123` |
| 👤 Staff | `staff`  | `staff123` |

---

## 📁 Project Structure

```
swiftpay-pos/
│
├── frontend/                    ← React + Vite app
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx             ← Entry point
│       ├── App.jsx              ← Auth gate (Login vs MainShell)
│       │
│       ├── context/
│       │   └── AuthContext.jsx  ← Login state, user list, permissions
│       │
│       ├── data/
│       │   └── seedData.js      ← Default products, mock transactions, users
│       │
│       ├── utils/
│       │   └── helpers.js       ← Formatting, invoice download, CSV export
│       │
│       ├── styles/
│       │   └── tokens.js        ← All colours, fonts, border-radii
│       │
│       ├── pages/               ← ONE FILE PER SCREEN
│       │   ├── LoginPage.jsx        ← Login screen
│       │   ├── MainShell.jsx        ← After login: holds global state + nav
│       │   ├── CashierPage.jsx      ← POS screen (product grid + cart)
│       │   ├── TransactionsPage.jsx ← View/filter/export transactions
│       │   ├── ProductsPage.jsx     ← (Owner) Add/manage products & categories
│       │   └── UsersPage.jsx        ← (Owner) Manage staff accounts
│       │
│       └── components/          ← Reusable UI pieces
│           ├── TopBar.jsx           ← Navigation bar
│           ├── ProductGrid.jsx      ← Product tiles with category filter
│           ├── CartPanel.jsx        ← Right-side cart, totals, pay buttons
│           ├── PaymentModal.jsx     ← Card / QR / Processing / Success screens
│           ├── SuspendedDrawer.jsx  ← Resume on-hold orders
│           └── Toast.jsx            ← Notification pop-up
│
└── backend/                     ← Node.js + Express API
    ├── server.js                ← All routes in one readable file
    ├── schema.sql               ← Database schema reference
    └── package.json
```

---

## 🔐 Role Permissions

| Feature                        | 👑 Owner | 👤 Staff |
|-------------------------------|:-------:|:-------:|
| Cashier / process payments     | ✅ | ✅ |
| Suspend & resume orders        | ✅ | ✅ |
| Download invoice (after sale)  | ✅ | ✅ |
| View Transactions page         | ✅ | ✅ |
| Download invoice from history  | ✅ | ✅ |
| Export CSV reports             | ✅ | ❌ |
| Manage Products & Categories   | ✅ | ❌ |
| Manage Users                   | ✅ | ❌ |

---

## 💷 Currency
All prices are in **GBP (£)** with **20% UK VAT** applied at checkout.

---

## 🔌 Backend API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login |
| GET | `/users` | List users |
| POST | `/users` | Create user |
| DELETE | `/users/:id` | Delete user |
| GET | `/categories` | List categories |
| POST | `/categories` | Add category |
| DELETE | `/categories/:name` | Remove category |
| GET | `/products` | List products |
| POST | `/products` | Add product |
| PATCH | `/products/:id` | Toggle active |
| DELETE | `/products/:id` | Delete product |
| GET | `/transactions` | List (filter by date/method/status) |
| GET | `/transactions/:ref` | Single transaction |
| POST | `/transactions` | Record a sale |
| GET | `/summary` | Today's stats |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, inline CSS |
| State | React useState + Context API |
| Backend | Node.js, Express |
| Database | SQLite via better-sqlite3 |
| Fonts | Syne + JetBrains Mono (Google Fonts) |
=======
📌 Detailed Description

MySwift POS System is a full-stack Point of Sale (POS) application developed to streamline retail business operations. The system allows users to manage products, process sales, track inventory, handle customer data, and generate reports in real time.

🔹 Features:

Product and inventory management

Sales and billing system

Customer management

Dashboard with reports and analytics

Secure authentication system

Responsive and user-friendly interface

🔹 Tech Stack:

(You can edit this part according to your project)

Frontend: React.js

Backend: Node.js / Express

Database: MongoDB

REST APIs
>>>>>>> b948be3f540fd1ead71d2f65a76d95e5c2d3ce2b
