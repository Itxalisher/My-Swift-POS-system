-- backend/schema.sql — SQLite schema reference (server.js auto-creates these)

CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    username  TEXT NOT NULL UNIQUE,
    password  TEXT NOT NULL,
    role      TEXT NOT NULL DEFAULT 'staff'   -- 'owner' | 'staff'
);

CREATE TABLE IF NOT EXISTS categories (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT NOT NULL,
    price    REAL NOT NULL CHECK(price >= 0),
    emoji    TEXT DEFAULT '📦',
    category TEXT NOT NULL,
    active   INTEGER DEFAULT 1    -- 1=visible, 0=hidden on POS
);

CREATE TABLE IF NOT EXISTS transactions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    txn_ref    TEXT NOT NULL UNIQUE,
    subtotal   REAL NOT NULL,
    tax        REAL NOT NULL,
    total      REAL NOT NULL,
    method     TEXT NOT NULL,     -- 'Card' | 'QR'
    status     TEXT DEFAULT 'success',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS txn_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    txn_ref      TEXT NOT NULL,
    product_name TEXT NOT NULL,
    emoji        TEXT,
    price        REAL NOT NULL,
    qty          INTEGER NOT NULL,
    FOREIGN KEY (txn_ref) REFERENCES transactions(txn_ref)
);

-- Useful queries:
-- Today revenue:       SELECT SUM(total) FROM transactions WHERE status='success' AND DATE(created_at)=DATE('now');
-- Best sellers:        SELECT product_name, SUM(qty) units FROM txn_items GROUP BY product_name ORDER BY units DESC;
-- Sales by method:     SELECT method, COUNT(*), SUM(total) FROM transactions GROUP BY method;
