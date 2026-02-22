// ============================================================
//  src/pages/TransactionsPage.jsx
//  — Filter by date / method / status
//  — Click any row → full popup with items + payment details
//  — Download invoice from popup or inline button
//  — Export CSV (owner only)
// ============================================================
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { C, R } from '../styles/tokens.js'
import { fmt, fmtD, fmtT, downloadInvoice, downloadCSV } from '../utils/helpers.js'

// ── Transaction Detail Popup ────────────────────────────────
function TransactionPopup({ txn, onClose, onDownload }) {
  const [tab, setTab] = useState('items') // 'items' | 'payment'

  const statusColor  = txn.status === 'success' ? C.green  : C.red
  const statusBg     = txn.status === 'success' ? C.greenDim : C.redDim
  const methodColor  = txn.method === 'Card'    ? C.blue   : C.purple
  const methodBg     = txn.method === 'Card'    ? C.blueDim : C.purpleDim

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        className="scale-in"
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 24, width: '100%', maxWidth: 560,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 100px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        {/* ── Popup header ── */}
        <div style={{
          padding: '24px 28px 0',
          background: `linear-gradient(180deg, ${C.card} 0%, ${C.surface} 100%)`,
        }}>
          {/* Top row */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:12, color:C.textFaint, textTransform:'uppercase',
                            letterSpacing:1.5, marginBottom:4 }}>Transaction</div>
              <div style={{ fontSize:22, fontWeight:800, fontFamily:C.mono, color:C.textPrimary }}>
                {txn.id}
              </div>
            </div>
            <button onClick={onClose} style={{
              background: C.elevated, border:`1px solid ${C.border}`,
              borderRadius: R.md, padding:'8px 14px',
              color: C.textMuted, cursor:'pointer',
              fontFamily:'inherit', fontWeight:700, fontSize:13,
            }}>✕ Close</button>
          </div>

          {/* Status + method badges */}
          <div style={{ display:'flex', gap:8, marginBottom:20 }}>
            <span style={{
              background:statusBg, color:statusColor,
              border:`1px solid ${statusColor}44`,
              borderRadius:R.pill, padding:'5px 14px',
              fontSize:13, fontWeight:700,
            }}>
              {txn.status==='success' ? '✅ Approved' : '❌ Failed'}
            </span>
            <span style={{
              background:methodBg, color:methodColor,
              border:`1px solid ${methodColor}44`,
              borderRadius:R.pill, padding:'5px 14px',
              fontSize:13, fontWeight:700,
            }}>
              {txn.method==='Card' ? '💳 Card Payment' : '📱 QR Payment'}
            </span>
            <span style={{
              background:C.elevated, color:C.textMuted,
              borderRadius:R.pill, padding:'5px 14px', fontSize:12,
            }}>
              {fmtD(txn.time)} · {fmtT(txn.time)}
            </span>
          </div>

          {/* Big total */}
          <div style={{
            background: C.elevated, borderRadius:R.lg,
            padding:'18px 22px', marginBottom:20,
            display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <div>
              <div style={{ fontSize:12, color:C.textFaint, textTransform:'uppercase',
                            letterSpacing:1, marginBottom:4 }}>Total Charged</div>
              <div style={{ fontSize:32, fontWeight:800, color:C.green, fontFamily:C.mono }}>
                {fmt(txn.total)}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:12, color:C.textFaint, marginBottom:4 }}>
                {txn.items.reduce((s,i)=>s+i.qty,0)} items ordered
              </div>
              <div style={{ fontSize:13, color:C.textMuted }}>
                Subtotal {fmt(txn.subtotal)} + VAT {fmt(txn.tax)}
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${C.border}` }}>
            {[['items','🧾 Items Ordered'],['payment','💳 Payment Details']].map(([key,label]) => (
              <button key={key} onClick={()=>setTab(key)} style={{
                background:'none', border:'none', borderBottom:`2px solid ${tab===key?C.green:'transparent'}`,
                color: tab===key ? C.green : C.textMuted,
                padding:'10px 20px', cursor:'pointer', fontFamily:'inherit',
                fontWeight:700, fontSize:13, transition:'all 0.15s', marginBottom:-1,
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>

          {/* ITEMS TAB */}
          {tab==='items' && (
            <div>
              {txn.items.map((item, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:14,
                  background:C.card, borderRadius:R.md,
                  padding:'14px 16px', marginBottom:10,
                }}>
                  <div style={{
                    width:44, height:44, background:C.elevated,
                    borderRadius:R.md, display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:22, flexShrink:0,
                  }}>{item.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:700 }}>{item.name}</div>
                    <div style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>
                      {fmt(item.price)} each × {item.qty}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:16, fontWeight:800, color:C.green, fontFamily:C.mono }}>
                      {fmt(item.price * item.qty)}
                    </div>
                    <div style={{ fontSize:11, color:C.textFaint, marginTop:2 }}>qty: {item.qty}</div>
                  </div>
                </div>
              ))}

              {/* Order summary */}
              <div style={{
                background:C.card, border:`1px solid ${C.border}`,
                borderRadius:R.md, padding:'16px 18px', marginTop:6,
              }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                              fontSize:13, color:C.textMuted, marginBottom:8 }}>
                  <span>Subtotal (ex. VAT)</span>
                  <span style={{ fontFamily:C.mono }}>{fmt(txn.subtotal)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between',
                              fontSize:13, color:C.textMuted, marginBottom:10,
                              paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>
                  <span>VAT @ 20%</span>
                  <span style={{ fontFamily:C.mono }}>{fmt(txn.tax)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:800 }}>
                  <span>Total</span>
                  <span style={{ color:C.green, fontFamily:C.mono }}>{fmt(txn.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT DETAILS TAB */}
          {tab==='payment' && (
            <div>
              {/* Payment method card */}
              <div style={{
                background: txn.method==='Card' ? C.blueDim : C.purpleDim,
                border:`1px solid ${txn.method==='Card'?C.blue:C.purple}44`,
                borderRadius:R.lg, padding:'22px 24px', marginBottom:16,
                display:'flex', alignItems:'center', gap:18,
              }}>
                <div style={{
                  fontSize:48, width:70, height:70,
                  background:'rgba(0,0,0,0.2)', borderRadius:R.lg,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {txn.method==='Card' ? '💳' : '📱'}
                </div>
                <div>
                  <div style={{ fontSize:11, color:C.textFaint, textTransform:'uppercase',
                                letterSpacing:1.5, marginBottom:4 }}>Payment Method</div>
                  <div style={{ fontSize:22, fontWeight:800,
                                color:txn.method==='Card'?C.blue:C.purple }}>
                    {txn.method==='Card' ? 'Debit / Credit Card' : 'QR Code Payment'}
                  </div>
                  <div style={{ fontSize:13, color:C.textMuted, marginTop:4 }}>
                    {txn.method==='Card'
                      ? 'Chip & PIN or contactless terminal'
                      : 'Customer scanned via banking app'}
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                {[
                  ['Transaction ID', txn.id],
                  ['Date',           fmtD(txn.time)],
                  ['Time',           fmtT(txn.time)],
                  ['Status',         txn.status==='success'?'✅ Approved':'❌ Failed'],
                  ['Amount Charged', fmt(txn.total)],
                  ['VAT Amount',     fmt(txn.tax)],
                  ['Subtotal',       fmt(txn.subtotal)],
                  ['Items Count',    txn.items.reduce((s,i)=>s+i.qty,0)],
                ].map(([label, value]) => (
                  <div key={label} style={{
                    background:C.card, borderRadius:R.md, padding:'12px 16px',
                  }}>
                    <div style={{ fontSize:11, color:C.textFaint, textTransform:'uppercase',
                                  letterSpacing:1, marginBottom:4 }}>{label}</div>
                    <div style={{
                      fontSize:14, fontWeight:700,
                      fontFamily: ['Transaction ID','Amount Charged','VAT Amount','Subtotal'].includes(label) ? C.mono : 'inherit',
                      color: label==='Amount Charged' ? C.green
                           : label==='Status'         ? (txn.status==='success'?C.green:C.red)
                           : C.textPrimary,
                    }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* VAT breakdown */}
              <div style={{
                background:C.card, border:`1px solid ${C.green}22`,
                borderRadius:R.md, padding:'14px 18px',
              }}>
                <div style={{ fontSize:12, color:C.green, fontWeight:700,
                              textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
                  🇬🇧 UK VAT Breakdown
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13,
                              color:C.textMuted, marginBottom:6 }}>
                  <span>Net Amount (ex. VAT)</span>
                  <span style={{ fontFamily:C.mono }}>{fmt(txn.subtotal)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13,
                              color:C.textMuted, marginBottom:10,
                              paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>
                  <span>VAT at Standard Rate (20%)</span>
                  <span style={{ fontFamily:C.mono }}>{fmt(txn.tax)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between',
                              fontSize:15, fontWeight:800 }}>
                  <span>Gross Total (inc. VAT)</span>
                  <span style={{ color:C.green, fontFamily:C.mono }}>{fmt(txn.total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Popup footer ── */}
        <div style={{
          padding:'16px 28px', borderTop:`1px solid ${C.border}`,
          display:'flex', gap:10, background:C.surface, flexShrink:0,
        }}>
          <button onClick={() => { onDownload(txn); }} style={{
            flex:1, background:C.card, color:C.textSecondary,
            border:`1px solid ${C.border}`, borderRadius:R.md,
            padding:'12px', fontWeight:700, fontSize:14,
            cursor:'pointer', fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            transition:'all 0.15s',
          }}
            onMouseEnter={e=>{ e.currentTarget.style.background=C.elevated; e.currentTarget.style.color=C.textPrimary }}
            onMouseLeave={e=>{ e.currentTarget.style.background=C.card; e.currentTarget.style.color=C.textSecondary }}
          >
            📥 Download Invoice
          </button>
          <button onClick={onClose} style={{
            flex:1, background:C.green, color:C.bg,
            border:'none', borderRadius:R.md, padding:'12px',
            fontWeight:800, fontSize:14, cursor:'pointer',
            fontFamily:'inherit',
          }}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────
export default function TransactionsPage({ transactions, showToast }) {
  const { isOwner } = useAuth()

  const [dateFilter,   setDateFilter]   = useState('')
  const [methodFilter, setMethodFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected,     setSelected]     = useState(null)

  const filtered = transactions.filter(t => {
    const d = !dateFilter   || t.time.startsWith(dateFilter)
    const m = methodFilter==='All' || t.method===methodFilter
    const s = statusFilter==='All' || t.status===statusFilter
    return d && m && s
  })

  const ok       = filtered.filter(t=>t.status==='success')
  const revenue  = ok.reduce((s,t)=>s+t.total, 0)
  const cardRev  = ok.filter(t=>t.method==='Card').reduce((s,t)=>s+t.total,0)
  const qrRev    = ok.filter(t=>t.method==='QR').reduce((s,t)=>s+t.total,0)

  function handleDownload(txn) {
    downloadInvoice(txn)
    showToast(`📄 Invoice ${txn.id} downloaded`)
  }

  function handleExport() {
    if (!filtered.length) { showToast('No transactions to export', 'error'); return }
    downloadCSV(filtered, dateFilter||'all')
    showToast(`📊 ${filtered.length} transactions exported`)
  }

  const pill = (active, color=C.green) => ({
    background: active ? color : C.card,
    color:      active ? C.bg  : C.textMuted,
    border:`1px solid ${active?color:C.border}`,
    borderRadius:R.pill, padding:'6px 16px',
    fontWeight:700, fontSize:12, cursor:'pointer',
    fontFamily:'inherit', transition:'all 0.15s',
  })

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'24px 28px', background:C.bg }}>

      {/* ── Summary cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Total Revenue',  value:fmt(revenue),    icon:'💰', color:C.green  },
          { label:'Transactions',   value:ok.length,        icon:'✅', color:C.blue  },
          { label:'💳 Card Revenue', value:fmt(cardRev),    icon:'💳', color:C.purple },
          { label:'📱 QR Revenue',   value:fmt(qrRev),      icon:'📱', color:C.orange },
        ].map(c=>(
          <div key={c.label} style={{ background:C.surface, border:`1px solid ${C.border}`,
                borderRadius:R.lg, padding:'20px 22px' }}>
            <div style={{ fontSize:26, marginBottom:10 }}>{c.icon}</div>
            <div style={{ fontSize:22, fontWeight:800, color:c.color, fontFamily:C.mono }}>{c.value}</div>
            <div style={{ fontSize:11, color:C.textFaint, marginTop:3,
                          textTransform:'uppercase', letterSpacing:1 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>

        {/* Date */}
        <div style={{ display:'flex', alignItems:'center', gap:8, background:C.surface,
                      border:`1px solid ${C.border}`, borderRadius:R.md, padding:'8px 14px' }}>
          <span style={{ fontSize:14 }}>📅</span>
          <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}
            style={{ background:'transparent', border:'none', color:C.textPrimary,
                     fontSize:13, outline:'none', cursor:'pointer' }}/>
          {dateFilter && (
            <button onClick={()=>setDateFilter('')}
              style={{ background:'none', border:'none', color:C.textMuted, cursor:'pointer', fontSize:14 }}>✕</button>
          )}
        </div>

        {/* Method */}
        <div style={{ display:'flex', gap:6 }}>
          {['All','Card','QR'].map(m=>(
            <button key={m} style={pill(methodFilter===m, m==='Card'?C.blue:m==='QR'?C.purple:C.green)}
              onClick={()=>setMethodFilter(m)}>
              {m==='Card'?'💳 ':m==='QR'?'📱 ':''}{m}
            </button>
          ))}
        </div>

        {/* Status */}
        <div style={{ display:'flex', gap:6 }}>
          {[['All',C.green],['success',C.green],['failed',C.red]].map(([s,col])=>(
            <button key={s} style={pill(statusFilter===s, col)} onClick={()=>setStatusFilter(s)}>
              {s==='success'?'✅ ':s==='failed'?'❌ ':''}{s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>

        {/* Export — owner only */}
        {isOwner && (
          <button onClick={handleExport} style={{
            marginLeft:'auto', background:C.green, color:C.bg,
            border:'none', borderRadius:R.md, padding:'9px 18px',
            fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'inherit',
          }}>
            ⬇️ Export CSV {filtered.length>0 && `(${filtered.length})`}
          </button>
        )}
      </div>

      {/* ── Hint ── */}
      <div style={{ fontSize:12, color:C.textFaint, marginBottom:10 }}>
        💡 Click any row to view full order details and payment information
      </div>

      {/* ── Table ── */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:R.lg, overflow:'hidden' }}>
        {/* Header */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'130px 106px 80px 90px 60px 80px 80px 120px',
          padding:'12px 20px', borderBottom:`1px solid ${C.border}`,
          fontSize:11, color:C.textFaint, fontWeight:700,
          textTransform:'uppercase', letterSpacing:1,
        }}>
          <span>Ref</span><span>Date</span><span>Time</span>
          <span>Method</span><span>Items</span><span>VAT</span>
          <span>Total</span><span>Actions</span>
        </div>

        {filtered.length===0 && (
          <div style={{ padding:48, textAlign:'center', color:C.textFaint }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            No transactions match your filters
          </div>
        )}

        {filtered.map((t,i)=>(
          <div key={t.id}
            onClick={()=>setSelected(t)}
            style={{
              display:'grid',
              gridTemplateColumns:'130px 106px 80px 90px 60px 80px 80px 120px',
              padding:'14px 20px', cursor:'pointer',
              transition:'background 0.12s',
              borderBottom: i<filtered.length-1 ? `1px solid ${C.card}` : 'none',
              background:'transparent',
            }}
            onMouseEnter={e=>e.currentTarget.style.background=C.card}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}
          >
            <span style={{ fontSize:12, fontWeight:700, fontFamily:C.mono, color:C.textPrimary }}>
              {t.id}
            </span>
            <span style={{ fontSize:12, color:C.textSecondary }}>{fmtD(t.time)}</span>
            <span style={{ fontSize:12, color:C.textSecondary }}>{fmtT(t.time)}</span>
            <span style={{ fontSize:12, fontWeight:700, color:t.method==='Card'?C.blue:C.purple }}>
              {t.method==='Card'?'💳':'📱'} {t.method}
            </span>
            <span style={{ fontSize:12, color:C.textSecondary }}>
              {t.items.reduce((s,i)=>s+i.qty,0)}
            </span>
            <span style={{ fontSize:12, color:C.textMuted, fontFamily:C.mono }}>{fmt(t.tax)}</span>
            <span style={{ fontSize:13, fontWeight:800, fontFamily:C.mono,
                           color:t.status==='success'?C.green:C.red }}>
              {fmt(t.total)}
            </span>

            {/* Actions */}
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <button
                onClick={e=>{e.stopPropagation(); setSelected(t)}}
                style={{
                  background:C.elevated, border:`1px solid ${C.border}`,
                  borderRadius:R.sm, padding:'5px 9px',
                  fontSize:11, fontWeight:700, color:C.textSecondary,
                  cursor:'pointer', fontFamily:'inherit',
                }}
                onMouseEnter={e=>{e.currentTarget.style.background=C.green;e.currentTarget.style.color=C.bg;e.currentTarget.style.borderColor=C.green}}
                onMouseLeave={e=>{e.currentTarget.style.background=C.elevated;e.currentTarget.style.color=C.textSecondary;e.currentTarget.style.borderColor=C.border}}
              >
                👁 View
              </button>
              <button
                onClick={e=>{e.stopPropagation(); handleDownload(t)}}
                style={{
                  background:'transparent', border:'none',
                  borderRadius:R.sm, padding:'5px 8px',
                  fontSize:14, cursor:'pointer', color:C.textMuted,
                }}
                title="Download Invoice"
                onMouseEnter={e=>e.currentTarget.style.color=C.green}
                onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}
              >
                📄
              </button>
              <span style={{
                fontSize:11, fontWeight:700,
                color:t.status==='success'?C.green:C.red,
                background:t.status==='success'?C.greenDim:C.redDim,
                borderRadius:R.sm, padding:'4px 8px',
              }}>
                {t.status==='success'?'✓':'✗'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Detail popup ── */}
      {selected && (
        <TransactionPopup
          txn={selected}
          onClose={()=>setSelected(null)}
          onDownload={txn=>{ handleDownload(txn); setSelected(null) }}
        />
      )}
    </div>
  )
}
