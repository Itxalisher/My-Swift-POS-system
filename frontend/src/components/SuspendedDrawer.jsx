// src/components/SuspendedDrawer.jsx — Modal showing all suspended (on-hold) orders
import { C, R } from '../styles/tokens.js'
import { fmt, fmtT } from '../utils/helpers.js'

export default function SuspendedDrawer({ orders, onResume, onDelete, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
                  backdropFilter:'blur(6px)', display:'flex', alignItems:'center',
                  justifyContent:'center', zIndex:200 }}
         onClick={onClose}>
      <div className="scale-in"
           onClick={e=>e.stopPropagation()}
           style={{ background:C.surface, border:`1px solid ${C.border}`,
                    borderRadius:24, padding:32, width:500,
                    maxHeight:'80vh', display:'flex', flexDirection:'column',
                    boxShadow:'0 24px 80px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h3 style={{ fontSize:20, fontWeight:800 }}>🟡 Suspended Orders</h3>
            <p style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>
              {orders.length} order{orders.length!==1?'s':''} on hold
            </p>
          </div>
          <button onClick={onClose}
            style={{ background:C.card, border:`1px solid ${C.border}`, color:C.textMuted,
                     borderRadius:R.md, padding:'8px 16px', cursor:'pointer',
                     fontFamily:'inherit', fontWeight:700 }}>
            Close
          </button>
        </div>

        {/* Order list */}
        <div style={{ overflowY:'auto', flex:1 }}>
          {orders.length===0 ? (
            <div style={{ textAlign:'center', padding:40, color:C.textFaint }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🕐</div>
              No suspended orders
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id}
                style={{ background:C.card, border:`1px solid ${C.orange}33`,
                         borderRadius:R.lg, padding:18, marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                              alignItems:'flex-start', marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.orange }}>
                      Saved at {fmtT(order.savedAt)}
                    </div>
                    <div style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>
                      {order.cart.reduce((s,i)=>s+i.qty,0)} items
                    </div>
                  </div>
                  <div style={{ fontSize:20, fontWeight:800, color:C.orange, fontFamily:C.mono }}>
                    {fmt(order.total)}
                  </div>
                </div>

                {/* Item chips */}
                <div style={{ marginBottom:14, display:'flex', flexWrap:'wrap', gap:6 }}>
                  {order.cart.map(i=>(
                    <span key={i.id}
                      style={{ background:C.elevated, borderRadius:R.sm,
                               padding:'4px 10px', fontSize:12, color:C.textSecondary }}>
                      {i.emoji} {i.name} ×{i.qty}
                    </span>
                  ))}
                </div>

                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>onResume(order)}
                    style={{ flex:1, background:C.green, color:C.bg, border:'none',
                             borderRadius:R.md, padding:'11px', fontWeight:800,
                             fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>
                    ▶ Resume Order
                  </button>
                  <button onClick={()=>onDelete(order.id)}
                    style={{ background:C.redDim, border:'none', color:C.red,
                             borderRadius:R.md, padding:'11px 16px', cursor:'pointer',
                             fontSize:14, fontFamily:'inherit' }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
