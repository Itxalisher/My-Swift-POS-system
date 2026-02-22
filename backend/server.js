// ============================================================
//  backend/server.js  —  SwiftPay POS  Node.js / Express API
//  Run:  npm install  then  npm start
//  API available at http://localhost:3001
// ============================================================

const express = require('express')
const cors    = require('cors')
const Database = require('better-sqlite3')
const path     = require('path')

const app = express()
app.use(cors())
app.use(express.json())

// ── Database (auto-created on first run) ──────────────────
const db = new Database(path.join(__dirname, 'pos.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    username  TEXT NOT NULL UNIQUE,
    password  TEXT NOT NULL,          -- NOTE: hash in production!
    role      TEXT NOT NULL DEFAULT 'staff'  -- 'owner' | 'staff'
  );

  CREATE TABLE IF NOT EXISTS categories (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS products (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    price     REAL NOT NULL CHECK(price >= 0),
    emoji     TEXT DEFAULT '📦',
    category  TEXT NOT NULL,
    active    INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    txn_ref     TEXT NOT NULL UNIQUE,
    subtotal    REAL NOT NULL,
    tax         REAL NOT NULL,
    total       REAL NOT NULL,
    method      TEXT NOT NULL,        -- 'Card' | 'QR'
    status      TEXT DEFAULT 'success',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS txn_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    txn_ref     TEXT NOT NULL,
    product_name TEXT NOT NULL,
    emoji       TEXT,
    price       REAL NOT NULL,
    qty         INTEGER NOT NULL,
    FOREIGN KEY (txn_ref) REFERENCES transactions(txn_ref)
  );
`)

// Seed default data if empty
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get()
if (userCount.c === 0) {
  db.prepare("INSERT INTO users (name,username,password,role) VALUES (?,?,?,?)").run('Ali (Owner)','owner','owner123','owner')
  db.prepare("INSERT INTO users (name,username,password,role) VALUES (?,?,?,?)").run('Sara (Staff)','staff','staff123','staff')
  ;['Food','Drinks','Snacks'].forEach(c => db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)').run(c))
  const ins = db.prepare('INSERT INTO products (name,price,emoji,category) VALUES (?,?,?,?)')
  ;[
    ['Coffee',3.50,'☕','Drinks'],['Tea',2.50,'🍵','Drinks'],
    ['Sandwich',7.99,'🥪','Food'],['Muffin',3.25,'🧁','Snacks'],
    ['Orange Juice',4.00,'🍊','Drinks'],['Salad',9.50,'🥗','Food'],
    ['Latte',5.00,'🥛','Drinks'],['Wrap',8.50,'🌯','Food'],
    ['Cookie',2.00,'🍪','Snacks'],['Smoothie',6.50,'🥤','Drinks'],
  ].forEach(r => ins.run(...r))
  console.log('✅ Database seeded.')
}

// ── AUTH ──────────────────────────────────────────────────
app.post('/auth/login', (req,res) => {
  const { username, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE username=? AND password=?').get(username, password)
  if (!user) return res.status(401).json({ error:'Invalid credentials' })
  const { password: _pw, ...safe } = user
  res.json(safe)
})

// ── USERS ──────────────────────────────────────────────────
app.get('/users',      (_,res) => res.json(db.prepare('SELECT id,name,username,role FROM users').all()))
app.post('/users',     (req,res) => {
  const { name, username, password, role='staff' } = req.body
  if (!name||!username||!password) return res.status(400).json({error:'name, username, password required'})
  try {
    const r = db.prepare('INSERT INTO users (name,username,password,role) VALUES (?,?,?,?)').run(name,username,password,role)
    res.status(201).json({ id:r.lastInsertRowid, name, username, role })
  } catch { res.status(409).json({error:'Username already taken'}) }
})
app.delete('/users/:id', (req,res) => {
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id)
  res.json({ ok:true })
})

// ── CATEGORIES ─────────────────────────────────────────────
app.get('/categories', (_,res) => res.json(db.prepare('SELECT name FROM categories').all().map(r=>r.name)))
app.post('/categories', (req,res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({error:'name required'})
  try {
    db.prepare('INSERT INTO categories (name) VALUES (?)').run(name.trim())
    res.status(201).json({ name: name.trim() })
  } catch { res.status(409).json({error:'Category already exists'}) }
})
app.delete('/categories/:name', (req,res) => {
  db.prepare('DELETE FROM categories WHERE name=?').run(decodeURIComponent(req.params.name))
  res.json({ ok:true })
})

// ── PRODUCTS ───────────────────────────────────────────────
app.get('/products',    (_,res) => res.json(db.prepare('SELECT * FROM products').all()))
app.post('/products',   (req,res) => {
  const { name, price, emoji='📦', category } = req.body
  if (!name||!price||!category) return res.status(400).json({error:'name, price, category required'})
  const r = db.prepare('INSERT INTO products (name,price,emoji,category) VALUES (?,?,?,?)').run(name,price,emoji,category)
  res.status(201).json({ id:r.lastInsertRowid, name, price, emoji, category, active:1 })
})
app.patch('/products/:id', (req,res) => {
  const { active } = req.body
  db.prepare('UPDATE products SET active=? WHERE id=?').run(active?1:0, req.params.id)
  res.json({ ok:true })
})
app.delete('/products/:id', (req,res) => {
  db.prepare('DELETE FROM products WHERE id=?').run(req.params.id)
  res.json({ ok:true })
})

// ── TRANSACTIONS ───────────────────────────────────────────
app.get('/transactions', (req,res) => {
  const { date, method, status } = req.query
  let q = 'SELECT * FROM transactions WHERE 1=1'
  const params = []
  if (date)   { q += ' AND DATE(created_at)=?'; params.push(date) }
  if (method) { q += ' AND method=?';           params.push(method) }
  if (status) { q += ' AND status=?';           params.push(status) }
  q += ' ORDER BY created_at DESC'
  const txns = db.prepare(q).all(...params)
  const result = txns.map(t => ({
    ...t,
    items: db.prepare('SELECT * FROM txn_items WHERE txn_ref=?').all(t.txn_ref),
  }))
  res.json(result)
})

app.get('/transactions/:ref', (req,res) => {
  const t = db.prepare('SELECT * FROM transactions WHERE txn_ref=?').get(req.params.ref)
  if (!t) return res.status(404).json({error:'Not found'})
  t.items = db.prepare('SELECT * FROM txn_items WHERE txn_ref=?').all(t.txn_ref)
  res.json(t)
})

app.post('/transactions', (req,res) => {
  const { cart, method, subtotal, tax, total } = req.body
  if (!cart?.length) return res.status(400).json({error:'Cart is empty'})
  const ref  = 'TXN-' + Date.now().toString(36).toUpperCase()
  const doInsert = db.transaction(() => {
    db.prepare('INSERT INTO transactions (txn_ref,subtotal,tax,total,method) VALUES (?,?,?,?,?)')
      .run(ref, subtotal, tax, total, method)
    cart.forEach(i =>
      db.prepare('INSERT INTO txn_items (txn_ref,product_name,emoji,price,qty) VALUES (?,?,?,?,?)')
        .run(ref, i.name, i.emoji, i.price, i.qty)
    )
  })
  doInsert()
  res.status(201).json({ txn_ref:ref, total, status:'success' })
})

// ── SUMMARY ────────────────────────────────────────────────
app.get('/summary', (_,res) => {
  const stats = db.prepare(`
    SELECT COUNT(*) total, SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) success_count,
    ROUND(SUM(CASE WHEN status='success' THEN total ELSE 0 END),2) revenue
    FROM transactions WHERE DATE(created_at)=DATE('now')
  `).get()
  const byMethod = db.prepare(`
    SELECT method, COUNT(*) cnt, ROUND(SUM(total),2) rev
    FROM transactions WHERE status='success' AND DATE(created_at)=DATE('now')
    GROUP BY method
  `).all()
  res.json({ ...stats, byMethod })
})

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`\n⚡ SwiftPay POS backend → http://localhost:${PORT}`)
  console.log('   POST /auth/login     — sign in')
  console.log('   GET  /products       — list products')
  console.log('   POST /transactions   — record a sale')
  console.log('   GET  /transactions   — list all sales')
  console.log('   GET  /summary        — today\'s stats\n')
})
