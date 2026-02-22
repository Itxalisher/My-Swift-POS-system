// src/components/CartPanel.jsx — Right panel: order list, totals, action buttons
import { C, R } from '../styles/tokens.js'
import { fmt } from '../utils/helpers.js'

export default function CartPanel({
  cart, subtotal, tax, total,
  onUpdateQty, onRemove, onClear, onSuspend,
  onPayCard, onPayQR,
  onShowSuspended, suspendedCount,
}) {
  const itemCount = cart.reduce((s,i)=>s+i.qty,0)

  return (
    <div style={{ width:320, background:C.surface, borderLeft:`1px solid ${C.border}`,
                  display:'flex', flexDirection:'column', padding:'18px 18px', flexShrink:0 }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexShrink:0 }}>
        <span style={{ fontSize:11, fontWeight:700, color:C.textFaint,
                       textTransform:'uppercase', letterSpacing:1.5 }}>Current Order</span>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {itemCount>0 && (
            <span style={{ background:C.green, color:C.bg, borderRadius:R.pill,
                           padding:'2px 10px', fontSize:11, fontWeight:800 }}>
              {itemCount}
            </span>
          )}
          {suspendedCount>0 && (
            <button onClick={onShowSuspended}
              style={{ background:C.orangeDim, color:C.orange, border:'none',
                       borderRadius:R.sm, padding:'3px 9px', fontSize:11,
                       fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              🟡 {suspendedCount}
            </button>
          )}
        </div>
      </div>

      {/* Cart items — scrollable */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {cart.length===0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
                        justifyContent:'center', height:'100%', color:C.textFaint }}>
            <div style={{ fontSize:44, marginBottom:12, filter:'grayscale(1)' }}>🛒</div>
            <div style={{ fontWeight:700, color:C.textFaint }}>Cart is empty</div>
            <div style={{ fontSize:12, marginTop:4, color:C.textFaint }}>Tap products to add items</div>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="fade-in"
              style={{ display:'flex', alignItems:'center', gap:8,
                       background:C.card, borderRadius:R.md,
                       padding:'10px 10px', marginBottom:6 }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{item.emoji}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700,
                              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {item.name}
                </div>
                <div style={{ fontSize:11, color:C.green, fontFamily:C.mono }}>
                  {fmt(item.price * item.qty)}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                <button onClick={()=>onUpdateQty(item.id,-1)}
                  style={qtyBtnStyle}>−</button>
                <span style={{ minWidth:18, textAlign:'center', fontSize:13,
                               fontWeight:800, fontFamily:C.mono }}>{item.qty}</span>
                <button onClick={()=>onUpdateQty(item.id,+1)}
                  style={qtyBtnStyle}>+</button>
                <button onClick={()=>onRemove(item.id)}
                  style={{ background:'none', border:'none', color:C.textFaint,
                           cursor:'pointer', fontSize:14, padding:'0 2px',
                           transition:'color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color=C.red}
                  onMouseLeave={e=>e.currentTarget.style.color=C.textFaint}>
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals + action buttons */}
      {cart.length>0 && (
        <div style={{ flexShrink:0 }}>
          <div style={{ borderTop:`1px solid ${C.border}`, marginTop:10, paddingTop:12 }}>
            <Row label="Subtotal"    value={fmt(subtotal)} />
            <Row label="VAT (20%)"   value={fmt(tax)}      />
            <div style={{ display:'flex', justifyContent:'space-between',
                          fontSize:20, fontWeight:800, marginTop:8 }}>
              <span>Total</span>
              <span style={{ color:C.green, fontFamily:C.mono }}>{fmt(total)}</span>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:14 }}>
            <button onClick={onClear}
              style={actionBtn(C.red, C.redDim, true)}>
              🗑️ Clear
            </button>
            <button onClick={onSuspend}
              style={actionBtn(C.orange, C.orangeDim, true)}>
              🟡 Suspend
            </button>
            <button onClick={onPayCard}
              style={actionBtn(C.green, null, false)}>
              💳 Card
            </button>
            <button onClick={onPayQR}
              style={actionBtn(C.purple, null, false, '#fff')}>
              📱 QR Pay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between',
                  fontSize:12, color:'#6b7280', marginBottom:4 }}>
      <span>{label}</span>
      <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>{value}</span>
    </div>
  )
}

const qtyBtnStyle = {
  background:'#1e2236', border:'none', color:'#e8eaf0',
  width:24, height:24, borderRadius:6, cursor:'pointer',
  fontSize:14, fontWeight:700, display:'flex',
  alignItems:'center', justifyContent:'center', fontFamily:'inherit',
}

function actionBtn(color, bg, outline, textColor) {
  return {
    background: outline ? (bg||'transparent') : color,
    color:      outline ? color : (textColor||'#0c0e14'),
    border:     outline ? `1.5px solid ${color}44` : 'none',
    borderRadius:10, padding:'12px 0',
    fontWeight:700, fontSize:13, cursor:'pointer',
    fontFamily:'inherit', transition:'all 0.15s',
  }
}
