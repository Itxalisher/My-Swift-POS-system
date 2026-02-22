// src/components/PaymentModal.jsx — Full payment flow: card / QR / processing / success
import { useState, useEffect } from 'react'
import { C, R } from '../styles/tokens.js'
import { fmt } from '../utils/helpers.js'

export default function PaymentModal({
  method, total, payState, lastTxn, cart, subtotal, tax,
  onConfirm, onClose, onDownloadInvoice,
}) {
  const [cardStep, setCardStep] = useState('insert')   // insert → pin → (confirm)
  const [qrTimer,  setQrTimer]  = useState(90)
  const [procStep, setProcStep] = useState(0)

  // ── Card: auto-advance insert → pin ───────────────────────
  useEffect(() => {
    if (method==='card' && payState==='idle' && cardStep==='insert') {
      const t = setTimeout(()=>setCardStep('pin'), 1600)
      return ()=>clearTimeout(t)
    }
  }, [method, payState, cardStep])

  // ── Card: auto-advance pin → confirm ──────────────────────
  useEffect(() => {
    if (method==='card' && payState==='idle' && cardStep==='pin') {
      const t = setTimeout(()=>onConfirm(), 1600)
      return ()=>clearTimeout(t)
    }
  }, [method, payState, cardStep])

  // ── QR: countdown timer ───────────────────────────────────
  useEffect(() => {
    if (method==='qr' && payState==='idle') {
      if (qrTimer<=0) { onClose(); return }
      const t = setTimeout(()=>setQrTimer(q=>q-1), 1000)
      return ()=>clearTimeout(t)
    }
  }, [method, payState, qrTimer])

  // ── Processing: step animation ────────────────────────────
  useEffect(() => {
    if (payState==='processing') {
      [1,2,3].forEach(s=>setTimeout(()=>setProcStep(s), s*900))
    }
  }, [payState])

  const overlay = {
    position:'fixed', inset:0, background:'rgba(0,0,0,0.82)',
    backdropFilter:'blur(8px)', display:'flex', alignItems:'center',
    justifyContent:'center', zIndex:200,
  }
  const modal = {
    background:C.surface, border:`1px solid ${C.border}`,
    borderRadius:R.xl, padding:40, width:420,
    textAlign:'center', boxShadow:'0 28px 80px rgba(0,0,0,0.55)',
  }

  // ── SUCCESS screen ─────────────────────────────────────────
  if (payState==='success' && lastTxn) return (
    <div style={overlay}>
      <div className="scale-in" style={modal}>
        <div style={{ fontSize:72, marginBottom:12 }}>🎉</div>
        <div style={{ fontSize:24, fontWeight:800, color:C.green, marginBottom:4 }}>Payment Approved!</div>
        <div style={{ fontSize:36, fontWeight:800, fontFamily:C.mono, marginBottom:4 }}>{fmt(total)}</div>
        <div style={{ color:C.textMuted, fontSize:13, marginBottom:24 }}>
          via {method==='card'?'💳 Card':'📱 QR'} · {new Date().toLocaleTimeString()}
        </div>

        {/* Receipt preview */}
        <div style={{ background:C.card, borderRadius:R.md, padding:'14px 16px', marginBottom:22, textAlign:'left' }}>
          {cart.map((i,idx)=>(
            <div key={idx} style={{ display:'flex', justifyContent:'space-between',
                                    fontSize:13, color:C.textSecondary, marginBottom:4 }}>
              <span>{i.emoji} {i.name} × {i.qty}</span>
              <span style={{ fontFamily:C.mono }}>{fmt(i.price*i.qty)}</span>
            </div>
          ))}
          <div style={{ borderTop:`1px solid ${C.border}`, marginTop:8, paddingTop:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:C.textMuted, marginBottom:3 }}>
              <span>Subtotal</span><span style={{fontFamily:C.mono}}>{fmt(subtotal)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:C.textMuted }}>
              <span>VAT (20%)</span><span style={{fontFamily:C.mono}}>{fmt(tax)}</span>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:10 }}>
          <button onClick={onDownloadInvoice}
            style={{ background:C.card, color:C.textSecondary, border:`1px solid ${C.border}`,
                     borderRadius:R.md, padding:'13px', fontWeight:700, fontSize:13,
                     cursor:'pointer', fontFamily:'inherit' }}>
            📄 Invoice
          </button>
          <button onClick={onClose}
            style={{ background:C.green, color:C.bg, border:'none',
                     borderRadius:R.md, padding:'13px', fontWeight:800, fontSize:15,
                     cursor:'pointer', fontFamily:'inherit' }}>
            ✅ New Order
          </button>
        </div>
      </div>
    </div>
  )

  // ── PROCESSING screen ──────────────────────────────────────
  if (payState==='processing') return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ fontSize:64, marginBottom:18 }}>
          {['','⌛','🔄','✅'][procStep]}
        </div>
        <div style={{ fontSize:20, fontWeight:800, marginBottom:22 }}>Processing Payment…</div>
        {['Connecting to bank','Authorising transaction','Confirming payment'].map((s,i)=>(
          <div key={s} style={{ display:'flex', alignItems:'center', gap:12,
                                marginBottom:12, opacity:procStep>=i+1?1:0.2, transition:'opacity 0.5s' }}>
            <span style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, display:'flex',
                           alignItems:'center', justifyContent:'center', fontSize:12,
                           background: procStep>i+1?C.green:procStep===i+1?C.yellow:C.border,
                           color: procStep>i+1?C.bg:'#fff' }}>
              {procStep>i+1 ? '✓' : procStep===i+1 ?
                <span className="spinner" style={{ width:8,height:8,borderRadius:'50%',
                  border:`2px solid ${C.yellow}`, borderTopColor:'transparent', display:'inline-block' }}/> : ''}
            </span>
            <span style={{ fontSize:14, color:C.textSecondary, textAlign:'left' }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )

  // ── CARD payment screen ────────────────────────────────────
  if (method==='card') return (
    <div style={overlay} onClick={onClose}>
      <div className="scale-in" style={modal} onClick={e=>e.stopPropagation()}>
        <div style={{ fontSize:72, marginBottom:12 }}>
          {cardStep==='insert'?'💳':'🔢'}
        </div>
        <div style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>
          {cardStep==='insert'?'Insert or Tap Card':'Enter PIN'}
        </div>
        <div style={{ color:C.textMuted, fontSize:14, marginBottom:24 }}>
          {cardStep==='insert'?'Waiting for card on terminal…':'Customer entering PIN securely…'}
        </div>
        {/* Progress bar */}
        <div style={{ height:4, background:C.border, borderRadius:4, overflow:'hidden', marginBottom:24 }}>
          <div style={{ height:'100%', background:C.green, borderRadius:4,
                        width: cardStep==='insert'?'40%':'85%', transition:'width 1.6s ease' }} />
        </div>
        {/* Amount */}
        <div style={{ display:'flex', justifyContent:'space-between', background:C.card,
                      borderRadius:R.md, padding:'14px 18px', marginBottom:20 }}>
          <span style={{ color:C.textMuted, fontSize:13 }}>Amount to charge</span>
          <span style={{ fontSize:20, fontWeight:800, color:C.green, fontFamily:C.mono }}>{fmt(total)}</span>
        </div>
        <div className="pulse" style={{ fontSize:12, color:C.textFaint, marginBottom:20 }}>
          🔒 Secure connection active
        </div>
        <button onClick={onClose}
          style={{ background:'none', border:'none', color:C.textMuted,
                   cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
          ✕ Cancel transaction
        </button>
      </div>
    </div>
  )

  // ── QR payment screen ──────────────────────────────────────
  if (method==='qr') return (
    <div style={overlay} onClick={onClose}>
      <div className="scale-in" style={modal} onClick={e=>e.stopPropagation()}>
        <div style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Scan to Pay</div>
        <div style={{ color:C.textMuted, fontSize:13, marginBottom:18 }}>
          Customer scans with their banking app
        </div>

        {/* Fake QR code */}
        <div style={{ width:180, height:180, background:'#fff', borderRadius:14,
                      padding:12, margin:'0 auto 18px', display:'grid',
                      gridTemplateColumns:'repeat(10,1fr)', gap:2 }}>
          {Array.from({length:100}).map((_,i)=>{
            const dark = Math.sin(i*13.7+2.4)>0.1 ||
                         [0,1,2,3,10,11,12,13,20,21,22,23,6,7,8,16,17,18,26,27,28,
                          70,71,72,80,81,82,90,91,92,76,77,78,86,87,88,96,97,98].includes(i)
            return <div key={i} style={{ background:dark?C.bg:'#fff', borderRadius:1 }}/>
          })}
        </div>

        <div style={{ fontSize:28, fontWeight:800, color:C.purple,
                      fontFamily:C.mono, marginBottom:8 }}>{fmt(total)}</div>

        {/* Timer */}
        <div style={{ display:'flex', alignItems:'center', gap:10,
                      justifyContent:'center', marginBottom:20 }}>
          <div style={{ flex:1, maxWidth:200, height:4, background:C.border, borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:4, transition:'width 1s, background 0.3s',
                          background: qrTimer>30?C.green:C.red,
                          width:`${(qrTimer/90)*100}%` }}/>
          </div>
          <span style={{ fontSize:13, fontFamily:C.mono,
                         color: qrTimer>30?C.textMuted:C.red, minWidth:32 }}>{qrTimer}s</span>
        </div>

        <button onClick={onConfirm}
          style={{ width:'100%', background:C.purple, color:'#fff', border:'none',
                   borderRadius:R.md, padding:'14px', fontWeight:800, fontSize:15,
                   cursor:'pointer', fontFamily:'inherit', marginBottom:12 }}>
          ✓ Confirm Payment Received
        </button>
        <button onClick={onClose}
          style={{ background:'none', border:'none', color:C.textMuted,
                   cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
          ✕ Cancel
        </button>
      </div>
    </div>
  )

  return null
}
