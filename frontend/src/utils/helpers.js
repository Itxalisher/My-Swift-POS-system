// src/utils/helpers.js — Shared utility functions
import { TAX_RATE, CURRENCY } from '../data/seedData.js'

export const fmt  = (n) => `${CURRENCY}${Number(n).toFixed(2)}`
export const fmtT = (iso) => new Date(iso).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
export const fmtD = (iso) => new Date(iso).toLocaleDateString([],{day:'numeric',month:'short',year:'numeric'})

export function calcTotals(cart) {
  const subtotal = parseFloat(cart.reduce((s,i) => s + i.price * i.qty, 0).toFixed(2))
  const tax      = parseFloat((subtotal * TAX_RATE).toFixed(2))
  const total    = parseFloat((subtotal + tax).toFixed(2))
  return { subtotal, tax, total }
}

export function genTxnId(count) {
  return `TXN-${String(count + 1).padStart(3,'0')}`
}

export function downloadInvoice(txn) {
  const TAX_PCT = (TAX_RATE * 100).toFixed(0)
  const SEP  = '═'.repeat(44)
  const THIN = '─'.repeat(44)
  const lines = [
    SEP,
    '        ⚡  SWIFTPAY POS  —  RECEIPT        ',
    SEP,
    `  Ref    : ${txn.id}`,
    `  Date   : ${fmtD(txn.time)}`,
    `  Time   : ${fmtT(txn.time)}`,
    `  Method : ${txn.method === 'Card' ? '💳 Debit / Credit Card' : '📱 QR Code Payment'}`,
    `  Status : ${txn.status === 'success' ? '✅ APPROVED' : '❌ FAILED'}`,
    THIN,
    '  ITEMS',
    THIN,
    ...txn.items.map(i =>
      `  ${(i.emoji+' '+i.name).padEnd(26)} x${i.qty}   ${fmt(i.price * i.qty)}`
    ),
    THIN,
    `  Subtotal (ex. VAT)  :  `.padEnd(36) + fmt(txn.subtotal),
    `  VAT (${TAX_PCT}%)           :  `.padEnd(36) + fmt(txn.tax),
    SEP,
    `  TOTAL              :  `.padEnd(36) + fmt(txn.total),
    SEP,
    '       Thank you for your business! 🙏      ',
    '          Powered by ALi Sher           ',
    SEP,
  ].join('\n')

  const blob = new Blob([lines], { type:'text/plain' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `Invoice_${txn.id}.txt`; a.click()
  URL.revokeObjectURL(url)
}

export function downloadCSV(txns, label='all') {
  const header = 'ID,Date,Time,Method,Items,Subtotal(£),VAT(£),Total(£),Status'
  const rows   = txns.map(t => [
    t.id, fmtD(t.time), fmtT(t.time), t.method,
    t.items.reduce((s,i)=>s+i.qty,0),
    t.subtotal.toFixed(2), t.tax.toFixed(2), t.total.toFixed(2), t.status
  ].join(','))
  const blob = new Blob([[header,...rows].join('\n')], {type:'text/csv'})
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `Transactions_${label}.csv`; a.click()
  URL.revokeObjectURL(url)
}
