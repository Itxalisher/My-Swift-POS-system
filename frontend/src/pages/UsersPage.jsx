// src/pages/UsersPage.jsx — (Owner only) Manage staff & owner accounts
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { C, R } from '../styles/tokens.js'

const ROLE_INFO = {
  owner: {
    label: '👑 Owner',
    color: C.orange,
    dim:   C.orangeDim,
    perms: ['Full dashboard access','Manage products & categories','Manage users','View all transactions','Export CSV reports','Download invoices'],
  },
  staff: {
    label: '👤 Staff',
    color: C.blue,
    dim:   C.blueDim,
    perms: ['Cashier / POS screen','Process card & QR payments','Suspend & resume orders','Download invoices from Transactions'],
  },
}

export default function UsersPage({ showToast }) {
  const { user, users, addUser, deleteUser } = useAuth()

  const [form, setForm] = useState({ name:'', username:'', password:'', role:'staff' })
  const [errors, setErrors] = useState({})

  const f = (k,v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})) }

  function validate() {
    const e = {}
    if (!form.name.trim())     e.name     = 'Full name is required'
    if (!form.username.trim()) e.username = 'Username is required'
    if (form.username.length < 3) e.username = 'Min 3 characters'
    if (users.find(u=>u.username===form.username.trim())) e.username = 'Username already taken'
    if (!form.password)        e.password = 'Password is required'
    if (form.password.length < 6) e.password = 'Min 6 characters'
    return e
  }

  function handleAdd() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    addUser({ name:form.name.trim(), username:form.username.trim(), password:form.password, role:form.role })
    setForm({ name:'', username:'', password:'', role:'staff' })
    showToast(`✅ User "${form.name.trim()}" created`)
  }

  function handleDelete(u) {
    if (u.id === user.id) { showToast("You can't delete your own account", 'error'); return }
    deleteUser(u.id)
    showToast(`🗑️ User "${u.name}" deleted`, 'error')
  }

  const inputStyle = (err) => ({
    width:'100%', background:C.card,
    border:`1.5px solid ${err?C.red:C.border}`,
    borderRadius:R.md, padding:'11px 14px',
    color:C.textPrimary, fontSize:14, outline:'none', fontFamily:'inherit',
  })

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'24px 28px', background:C.bg }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:24, alignItems:'start' }}>

        {/* ── LEFT: user list ─────────────────────────────── */}
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>User Accounts</h2>
          <p style={{ fontSize:13, color:C.textMuted, marginBottom:20 }}>
            Manage who can access the POS and what they can do.
          </p>

          {/* Permission reference cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
            {Object.entries(ROLE_INFO).map(([role, info]) => (
              <div key={role} style={{ background:C.surface, border:`1px solid ${C.border}`,
                                       borderRadius:R.lg, padding:18 }}>
                <div style={{ fontSize:16, fontWeight:800, color:info.color, marginBottom:10 }}>{info.label}</div>
                {info.perms.map(p => (
                  <div key={p} style={{ fontSize:12, color:C.textSecondary, marginBottom:5,
                                        display:'flex', alignItems:'flex-start', gap:7 }}>
                    <span style={{ color:info.color, marginTop:1 }}>✓</span> {p}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Users table */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:R.lg, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 130px 80px 100px',
                          padding:'11px 20px', borderBottom:`1px solid ${C.border}`,
                          fontSize:11, color:C.textFaint, fontWeight:700,
                          textTransform:'uppercase', letterSpacing:1 }}>
              <span>Name</span><span>Username</span><span>Role</span><span>Actions</span>
            </div>
            {users.map((u,i) => (
              <div key={u.id}
                style={{ display:'grid', gridTemplateColumns:'1fr 130px 80px 100px',
                         padding:'14px 20px', alignItems:'center',
                         borderBottom: i<users.length-1?`1px solid ${C.card}`:'none',
                         background: u.id===user.id?C.elevated:'transparent' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{u.name}</div>
                  {u.id===user.id && (
                    <div style={{ fontSize:11, color:C.green, marginTop:1 }}>● You</div>
                  )}
                </div>
                <span style={{ fontSize:13, fontFamily:C.mono, color:C.textSecondary }}>{u.username}</span>
                <span style={{ fontSize:12, fontWeight:700,
                  color: u.role==='owner'?C.orange:C.blue,
                  background: u.role==='owner'?C.orangeDim:C.blueDim,
                  borderRadius:R.pill, padding:'4px 10px', display:'inline-block' }}>
                  {u.role==='owner'?'👑 Owner':'👤 Staff'}
                </span>
                <button onClick={()=>handleDelete(u)}
                  disabled={u.id===user.id}
                  style={{ background: u.id===user.id?'transparent':C.redDim,
                           border:'none', color: u.id===user.id?C.textFaint:C.red,
                           borderRadius:R.sm, padding:'6px 12px', cursor: u.id===user.id?'not-allowed':'pointer',
                           fontSize:12, fontWeight:700, fontFamily:'inherit' }}>
                  {u.id===user.id ? '—' : '🗑️ Delete'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: add user form ─────────────────────────── */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`,
                      borderRadius:R.lg, padding:24, position:'sticky', top:0 }}>
          <h3 style={{ fontSize:16, fontWeight:800, marginBottom:20 }}>➕ Create New User</h3>

          {/* Full name */}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:C.textMuted, fontWeight:700,
                            textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>
              Full Name *
            </label>
            <input value={form.name} onChange={e=>f('name',e.target.value)}
              placeholder="e.g. Sara Ahmed" style={inputStyle(errors.name)}
              onFocus={e=>e.target.style.borderColor=errors.name?C.red:C.green}
              onBlur={e=>e.target.style.borderColor=errors.name?C.red:C.border} />
            {errors.name && <p style={{ color:C.red, fontSize:12, marginTop:4 }}>{errors.name}</p>}
          </div>

          {/* Username */}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:C.textMuted, fontWeight:700,
                            textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>
              Username *
            </label>
            <input value={form.username} onChange={e=>f('username',e.target.value.toLowerCase())}
              placeholder="e.g. sara" style={inputStyle(errors.username)}
              onFocus={e=>e.target.style.borderColor=errors.username?C.red:C.green}
              onBlur={e=>e.target.style.borderColor=errors.username?C.red:C.border} />
            {errors.username && <p style={{ color:C.red, fontSize:12, marginTop:4 }}>{errors.username}</p>}
          </div>

          {/* Password */}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:C.textMuted, fontWeight:700,
                            textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>
              Password * <span style={{ color:C.textFaint, fontWeight:400, textTransform:'none' }}>(min 6 chars)</span>
            </label>
            <input type="password" value={form.password} onChange={e=>f('password',e.target.value)}
              placeholder="••••••••" style={inputStyle(errors.password)}
              onFocus={e=>e.target.style.borderColor=errors.password?C.red:C.green}
              onBlur={e=>e.target.style.borderColor=errors.password?C.red:C.border} />
            {errors.password && <p style={{ color:C.red, fontSize:12, marginTop:4 }}>{errors.password}</p>}
          </div>

          {/* Role */}
          <div style={{ marginBottom:22 }}>
            <label style={{ fontSize:11, color:C.textMuted, fontWeight:700,
                            textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>
              Role *
            </label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {['staff','owner'].map(role => (
                <button key={role} onClick={()=>f('role',role)}
                  style={{ background: form.role===role ? ROLE_INFO[role].dim : C.card,
                           border:`2px solid ${form.role===role?ROLE_INFO[role].color:C.border}`,
                           borderRadius:R.md, padding:'12px 8px', cursor:'pointer',
                           fontFamily:'inherit', transition:'all 0.15s' }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{role==='owner'?'👑':'👤'}</div>
                  <div style={{ fontSize:13, fontWeight:800, color: form.role===role?ROLE_INFO[role].color:C.textSecondary }}>
                    {role.charAt(0).toUpperCase()+role.slice(1)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleAdd}
            style={{ width:'100%', background:C.green, color:C.bg, border:'none',
                     borderRadius:R.md, padding:'14px', fontWeight:800, fontSize:15,
                     cursor:'pointer', fontFamily:'inherit', transition:'filter 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.filter='brightness(1.1)'}
            onMouseLeave={e=>e.currentTarget.style.filter='brightness(1)'}>
            👤 Create Account
          </button>
        </div>
      </div>
    </div>
  )
}
