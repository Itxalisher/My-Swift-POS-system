// src/data/seedData.js — Default products, categories, mock transactions
export const TAX_RATE = 0.20          // 20% UK VAT
export const CURRENCY = '£'

export const INITIAL_CATEGORIES = ['Food', 'Drinks', 'Snacks']

export const INITIAL_PRODUCTS = [
  { id:1,  name:'Coffee',       price:3.50, emoji:'☕', category:'Drinks', active:true },
  { id:2,  name:'Tea',          price:2.50, emoji:'🍵', category:'Drinks', active:true },
  { id:3,  name:'Sandwich',     price:7.99, emoji:'🥪', category:'Food',   active:true },
  { id:4,  name:'Muffin',       price:3.25, emoji:'🧁', category:'Snacks', active:true },
  { id:5,  name:'Orange Juice', price:4.00, emoji:'🍊', category:'Drinks', active:true },
  { id:6,  name:'Salad',        price:9.50, emoji:'🥗', category:'Food',   active:true },
  { id:7,  name:'Water',        price:1.50, emoji:'💧', category:'Drinks', active:true },
  { id:8,  name:'Croissant',    price:4.75, emoji:'🥐', category:'Food',   active:true },
  { id:9,  name:'Latte',        price:5.00, emoji:'🥛', category:'Drinks', active:true },
  { id:10, name:'Wrap',         price:8.50, emoji:'🌯', category:'Food',   active:true },
  { id:11, name:'Cookie',       price:2.00, emoji:'🍪', category:'Snacks', active:true },
  { id:12, name:'Smoothie',     price:6.50, emoji:'🥤', category:'Drinks', active:true },
]

export const MOCK_TRANSACTIONS = [
  { id:'TXN-001', time:'2025-01-15T09:14:00', method:'Card', subtotal:14.12, tax:2.82, total:16.94,
    items:[{name:'Coffee',emoji:'☕',qty:2,price:3.50},{name:'Sandwich',emoji:'🥪',qty:1,price:7.99}], status:'success' },
  { id:'TXN-002', time:'2025-01-15T09:31:00', method:'QR',   subtotal:6.94,  tax:1.39, total:8.33,
    items:[{name:'Tea',emoji:'🍵',qty:2,price:2.50},{name:'Cookie',emoji:'🍪',qty:1,price:2.00}], status:'success' },
  { id:'TXN-003', time:'2025-01-15T10:02:00', method:'Card', subtotal:20.37, tax:4.07, total:24.44,
    items:[{name:'Latte',emoji:'🥛',qty:1,price:5.00},{name:'Salad',emoji:'🥗',qty:1,price:9.50},{name:'Wrap',emoji:'🌯',qty:1,price:8.50}], status:'success' },
  { id:'TXN-004', time:'2025-01-16T10:45:00', method:'QR',   subtotal:3.24,  tax:0.65, total:3.89,
    items:[{name:'Coffee',emoji:'☕',qty:1,price:3.50}], status:'success' },
  { id:'TXN-005', time:'2025-01-16T11:20:00', method:'Card', subtotal:17.00, tax:3.40, total:20.40,
    items:[{name:'Wrap',emoji:'🌯',qty:2,price:8.50}], status:'failed' },
  { id:'TXN-006', time:'2025-01-17T08:55:00', method:'QR',   subtotal:9.75,  tax:1.95, total:11.70,
    items:[{name:'Smoothie',emoji:'🥤',qty:1,price:6.50},{name:'Muffin',emoji:'🧁',qty:1,price:3.25}], status:'success' },
]

export const EMOJI_LIST = [
  '☕','🍵','🥪','🧁','🍊','🥗','💧','🥐','🥛','🌯',
  '🍪','🥤','🍕','🍔','🌮','🥙','🫔','🥞','🍩','🍰',
  '🎂','🍦','🍧','🥜','🧃','🥂','🍺','🧋','🫖','🍫',
]

// ── Default user accounts ──────────────────────────────────
// role: 'owner' | 'staff'
export const DEFAULT_USERS = [
  { id:1, name:'Ali (Owner)',  username:'owner', password:'owner123', role:'owner' },
  { id:2, name:'Sara (Staff)', username:'staff', password:'staff123', role:'staff' },
]
