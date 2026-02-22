// src/components/TopBar.jsx — Navigation bar + current user display
import { useAuth } from '../context/AuthContext.jsx'
import { C, R } from '../styles/tokens.js'

export default function TopBar({ screen, setScreen, suspendedCount }) {
  const { user, logout, isOwner } = useAuth()

  const NAV = [
    { key:'cashier',      label:'💳 Cashier',       always:true  },
    { key:'transactions', label:'📊 Transactions',   always:true  },
    { key:'products',     label:'🛍️ Products',       ownerOnly:true },
    { key:'users',        label:'👥 Users',           ownerOnly:true },
  ].filter(n => n.always || (n.ownerOnly && isOwner))

  return (
    <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
                  padding:'0 20px', display:'flex', alignItems:'center',
                  height:56, flexShrink:0, gap:8 }}>

      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:12 }}>
        <div style={{ width:34, height:34, background:'linear-gradient(135deg,#00e5a0,#00c4ff)',
                      borderRadius:10, display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:18, flexShrink:0 }}>⚡</div>
        <span style={{ fontSize:17, fontWeight:800, letterSpacing:'-0.5px', whiteSpace:'nowrap' }}>
          Swift<span style={{ color:C.green }}>Pay</span>
        </span>
      </div>

      {/* Nav */}
      {NAV.map(n => (
        <button key={n.key} onClick={()=>setScreen(n.key)}
          style={{ background: screen===n.key?C.green:'transparent',
                   color:      screen===n.key?C.bg:C.textMuted,
                   border:'none', borderRadius:R.md, padding:'7px 15px',
                   fontWeight:700, fontSize:13, cursor:'pointer',
                   transition:'all 0.15s', fontFamily:'inherit', whiteSpace:'nowrap' }}
          onMouseEnter={e=>{ if(screen!==n.key) e.currentTarget.style.background=C.card }}
          onMouseLeave={e=>{ if(screen!==n.key) e.currentTarget.style.background='transparent' }}>
          {n.label}
        </button>
      ))}

      {/* Suspended badge */}
      {suspendedCount > 0 && (
        <button onClick={()=>setScreen('cashier')}
          className="pulse"
          style={{ background:C.orangeDim, color:C.orange, border:`1px solid ${C.orange}44`,
                   borderRadius:R.md, padding:'6px 14px', fontSize:12, fontWeight:700,
                   cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
          🟡 {suspendedCount} Suspended
        </button>
      )}

      {/* Spacer */}
      <div style={{ flex:1 }} />

      {/* User info */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.textPrimary }}>{user?.name}</div>
          <div style={{ fontSize:11, color: isOwner?C.orange:C.blue, marginTop:1 }}>
            {isOwner?'👑 Owner':'👤 Staff'}
          </div>
        </div>
        <div style={{ width:1, height:28, background:C.border }} />
        <div style={{ fontSize:12, color:C.textMuted }}>🟢 Terminal #1</div>
        <button onClick={logout}
          style={{ background:C.redDim, border:'none', color:C.red, borderRadius:R.md,
                   padding:'7px 14px', fontWeight:700, fontSize:12,
                   cursor:'pointer', fontFamily:'inherit' }}>
          Logout
        </button>
      </div>
    </div>
  )
}
