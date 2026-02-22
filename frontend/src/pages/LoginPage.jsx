// ============================================================
//  src/pages/LoginPage.jsx
//  Full-screen split login — left branding, right form
// ============================================================
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { C, R } from '../styles/tokens.js'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [shake,    setShake]    = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (loading) return
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 700))
    const err = login(username.trim(), password)
    if (err) {
      setError(err); setLoading(false)
      setShake(true); setTimeout(() => setShake(false), 500)
    }
  }

  function fillDemo(role) {
    if (role === 'owner') { setUsername('owner'); setPassword('owner123') }
    else                  { setUsername('staff'); setPassword('staff123') }
    setError('')
  }

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      background: C.bg, overflow: 'hidden',
      backgroundImage: `
        radial-gradient(ellipse at 20% 50%, rgba(0,229,160,0.07) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 20%, rgba(0,196,255,0.05) 0%, transparent 50%)`,
    }}>

      {/* ── LEFT decorative panel ── */}
      <div style={{
        width: '42%', background: '#0e1118',
        borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.035,
          backgroundImage: `
            repeating-linear-gradient(0deg,transparent,transparent 39px,#00e5a0 39px,#00e5a0 40px),
            repeating-linear-gradient(90deg,transparent,transparent 39px,#00e5a0 39px,#00e5a0 40px)`,
        }}/>
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 320 }}>
          <div style={{
            width: 88, height: 88,
            background: 'linear-gradient(135deg,#00e5a0,#00c4ff)',
            borderRadius: 28, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 42,
            margin: '0 auto 28px', boxShadow: '0 20px 60px rgba(0,229,160,0.3)',
          }}>⚡</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>
            Swift<span style={{ color: C.green }}>Pay</span> POS
          </h1>
          <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, marginBottom: 40 }}>
            Point of Sale for modern UK merchants
          </p>
          {[
            ['💳','Card & QR payments'],['📊','GBP transaction reports'],
            ['🛍️','Product management'],['👥','Multi-user with roles'],
            ['📄','Instant invoice download'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12, textAlign:'left' }}>
              <div style={{
                width:32, height:32, background:C.greenDim,
                border:`1px solid ${C.green}33`, borderRadius:R.md,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:15, flexShrink:0,
              }}>{icon}</div>
              <span style={{ fontSize:13, color:C.textSecondary, fontWeight:600 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT form ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        <div className="scale-in" style={{
          width:'100%', maxWidth:440,
          transform: shake ? 'translateX(-8px)' : 'translateX(0)',
          transition: shake ? 'transform 0.07s' : 'transform 0.25s',
        }}>
          <div style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:26, fontWeight:800, marginBottom:6 }}>Welcome back 👋</h2>
            <p style={{ color:C.textMuted, fontSize:14 }}>Sign in to your terminal</p>
          </div>

          {/* Quick demo cards */}
          <p style={{ fontSize:11, fontWeight:700, color:C.textFaint,
                      textTransform:'uppercase', letterSpacing:1.5, marginBottom:10 }}>
            Demo quick-fill
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
            {[
              { role:'owner', label:'👑 Owner', user:'owner', pass:'owner123', color:C.orange, dim:C.orangeDim },
              { role:'staff', label:'👤 Staff',  user:'staff', pass:'staff123', color:C.blue,   dim:C.blueDim  },
            ].map(d => (
              <button key={d.role} onClick={() => fillDemo(d.role)} style={{
                background:d.dim, border:`1.5px solid ${d.color}44`,
                borderRadius:R.md, padding:'12px 14px', cursor:'pointer',
                textAlign:'left', fontFamily:'inherit', transition:'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor=d.color}
                onMouseLeave={e => e.currentTarget.style.borderColor=`${d.color}44`}
              >
                <div style={{ fontSize:14, fontWeight:800, color:d.color, marginBottom:3 }}>{d.label}</div>
                <div style={{ fontSize:11, color:C.textMuted, fontFamily:C.mono }}>{d.user} / {d.pass}</div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <div style={{ flex:1, height:1, background:C.border }}/>
            <span style={{ fontSize:12, color:C.textFaint }}>or sign in manually</span>
            <div style={{ flex:1, height:1, background:C.border }}/>
          </div>

          <form onSubmit={handleLogin}>
            {/* Username */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.textMuted,
                              textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>
                Username
              </label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>👤</span>
                <input value={username} onChange={e=>{setUsername(e.target.value);setError('')}}
                  placeholder="Enter username" required autoComplete="username"
                  style={{
                    width:'100%', background:C.card,
                    border:`1.5px solid ${username?C.green:C.border}`,
                    borderRadius:R.md, padding:'13px 16px 13px 44px',
                    color:C.textPrimary, fontSize:15, outline:'none',
                    boxShadow: username?`0 0 0 3px ${C.greenDim}`:'none', transition:'all 0.2s',
                  }}
                  onFocus={e=>{e.target.style.borderColor=C.green; e.target.style.boxShadow=`0 0 0 3px ${C.greenDim}`}}
                  onBlur={e=>{e.target.style.borderColor=username?C.green:C.border; e.target.style.boxShadow=username?`0 0 0 3px ${C.greenDim}`:'none'}}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.textMuted,
                              textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>
                Password
              </label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>🔑</span>
                <input type={showPass?'text':'password'} value={password}
                  onChange={e=>{setPassword(e.target.value);setError('')}}
                  placeholder="Enter password" required autoComplete="current-password"
                  style={{
                    width:'100%', background:C.card,
                    border:`1.5px solid ${password?C.green:C.border}`,
                    borderRadius:R.md, padding:'13px 48px 13px 44px',
                    color:C.textPrimary, fontSize:15, outline:'none',
                    boxShadow: password?`0 0 0 3px ${C.greenDim}`:'none', transition:'all 0.2s',
                  }}
                  onFocus={e=>{e.target.style.borderColor=C.green; e.target.style.boxShadow=`0 0 0 3px ${C.greenDim}`}}
                  onBlur={e=>{e.target.style.borderColor=password?C.green:C.border; e.target.style.boxShadow=password?`0 0 0 3px ${C.greenDim}`:'none'}}
                />
                <button type="button" onClick={()=>setShowPass(v=>!v)} style={{
                  position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer',
                  fontSize:16, color:C.textMuted, padding:2,
                }}>{showPass?'🙈':'👁️'}</button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background:C.redDim, border:`1px solid ${C.red}44`,
                borderRadius:R.md, padding:'11px 16px', color:C.red,
                fontSize:14, fontWeight:600, marginBottom:18,
                display:'flex', alignItems:'center', gap:8,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width:'100%',
              background: loading ? C.border : `linear-gradient(135deg,${C.green},#00c4a0)`,
              color: loading ? C.textMuted : C.bg,
              border:'none', borderRadius:R.md, padding:'15px',
              fontWeight:800, fontSize:16, cursor:loading?'not-allowed':'pointer',
              transition:'all 0.2s', fontFamily:'inherit',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(0,229,160,0.3)',
            }}>
              {loading
                ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                    <span className="spinner" style={{ width:16, height:16, borderRadius:'50%',
                      border:`2px solid ${C.textMuted}`, borderTopColor:'transparent', display:'inline-block' }}/>
                    Signing in…
                  </span>
                : '🔐 Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
