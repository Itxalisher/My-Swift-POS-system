// src/pages/ProductsPage.jsx — (Owner only) Manage products + categories
import { useState } from 'react'
import { C, R } from '../styles/tokens.js'
import { fmt } from '../utils/helpers.js'
import { EMOJI_LIST } from '../data/seedData.js'

export default function ProductsPage({ products, setProducts, categories, setCategories, nextId, showToast }) {
  // ── New product form state ─────────────────────────────────
  const [form, setForm] = useState({ name:'', price:'', emoji:'☕', category:'' })

  // ── New category state ─────────────────────────────────────
  const [newCat,     setNewCat]     = useState('')
  const [showCatMgr, setShowCatMgr] = useState(false)

  // ── Filter for the product list ────────────────────────────
  const [listFilter, setListFilter] = useState('All')

  const f = (k, v) => setForm(p => ({...p, [k]:v}))

  // ── Add product ────────────────────────────────────────────
  function addProduct() {
    if (!form.name.trim())    { showToast('Product name is required', 'error'); return }
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price)<=0)
      { showToast('Enter a valid price', 'error'); return }
    if (!form.category)       { showToast('Select a category', 'error'); return }

    const p = { id: nextId.current++, name:form.name.trim(),
                price:parseFloat(parseFloat(form.price).toFixed(2)),
                emoji:form.emoji, category:form.category, active:true }
    setProducts(prev => [...prev, p])
    setForm({ name:'', price:'', emoji:'☕', category:'' })
    showToast(`✅ "${p.name}" added to menu`)
  }

  function toggleActive(id) {
    setProducts(prev => prev.map(p => p.id===id ? {...p,active:!p.active} : p))
  }

  function deleteProduct(id) {
    setProducts(prev => prev.filter(p => p.id!==id))
    showToast('🗑️ Product deleted', 'error')
  }

  // ── Category management ────────────────────────────────────
  function addCategory() {
    const name = newCat.trim()
    if (!name) return
    if (categories.includes(name)) { showToast('Category already exists', 'error'); return }
    setCategories(prev => [...prev, name])
    setNewCat('')
    showToast(`✅ Category "${name}" created`)
  }

  function deleteCategory(cat) {
    if (products.some(p => p.category===cat)) {
      showToast(`Cannot remove "${cat}" — products are still using it`, 'error'); return
    }
    setCategories(prev => prev.filter(c => c!==cat))
    showToast(`🗑️ Category "${cat}" removed`)
  }

  const displayed = listFilter==='All' ? products : products.filter(p=>p.category===listFilter)

  const inputStyle = {
    width:'100%', background:C.card, border:`1.5px solid ${C.border}`,
    borderRadius:R.md, padding:'11px 14px', color:C.textPrimary,
    fontSize:14, outline:'none', transition:'border 0.2s',
  }

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'24px 28px', background:C.bg }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24, alignItems:'start' }}>

        {/* ── LEFT: product list ─────────────────────────── */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <h2 style={{ fontSize:20, fontWeight:800 }}>Menu Products</h2>
              <p style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>
                {products.filter(p=>p.active).length} active · {products.filter(p=>!p.active).length} hidden
              </p>
            </div>
            <button onClick={()=>setShowCatMgr(true)}
              style={{ background:C.card, border:`1px solid ${C.border}`, color:C.textSecondary,
                       borderRadius:R.md, padding:'9px 16px', fontWeight:700, fontSize:13,
                       cursor:'pointer', fontFamily:'inherit' }}>
              🏷️ Manage Categories
            </button>
          </div>

          {/* Category filter tabs */}
          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
            {['All', ...categories].map(c => (
              <button key={c} onClick={()=>setListFilter(c)}
                style={{ background: listFilter===c?C.green:C.card,
                         color:      listFilter===c?C.bg:C.textMuted,
                         border:`1px solid ${listFilter===c?C.green:C.border}`,
                         borderRadius:R.pill, padding:'6px 14px', fontSize:12,
                         fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                {c}
              </button>
            ))}
          </div>

          {/* Product table */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:R.lg, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'44px 1fr 110px 90px 80px 100px',
                          padding:'11px 16px', borderBottom:`1px solid ${C.border}`,
                          fontSize:11, color:C.textFaint, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>
              <span></span><span>Name</span><span>Category</span>
              <span>Price</span><span>Status</span><span>Actions</span>
            </div>
            {displayed.length===0 && (
              <div style={{ padding:32, textAlign:'center', color:C.textFaint }}>No products in this category</div>
            )}
            {displayed.map((p,i) => (
              <div key={p.id}
                style={{ display:'grid', gridTemplateColumns:'44px 1fr 110px 90px 80px 100px',
                         padding:'12px 16px', alignItems:'center', opacity:p.active?1:0.45,
                         borderBottom: i<displayed.length-1?`1px solid ${C.card}`:'none',
                         transition:'opacity 0.2s' }}>
                <span style={{ fontSize:22 }}>{p.emoji}</span>
                <span style={{ fontSize:13, fontWeight:700 }}>{p.name}</span>
                <span style={{ fontSize:11, background:C.elevated, borderRadius:R.sm,
                               padding:'3px 8px', color:C.textSecondary, display:'inline-block' }}>
                  {p.category}
                </span>
                <span style={{ fontSize:14, fontWeight:800, color:C.green, fontFamily:C.mono }}>{fmt(p.price)}</span>
                <span style={{ fontSize:11, fontWeight:700, color: p.active?C.green:C.textMuted }}>
                  {p.active?'● Active':'○ Hidden'}
                </span>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>toggleActive(p.id)} title={p.active?'Hide':'Show'}
                    style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:R.sm,
                             padding:'5px 8px', cursor:'pointer', fontSize:13, color:C.textSecondary }}>
                    {p.active?'👁️':'🚫'}
                  </button>
                  <button onClick={()=>deleteProduct(p.id)} title="Delete"
                    style={{ background:C.redDim, border:'none', borderRadius:R.sm,
                             padding:'5px 8px', cursor:'pointer', fontSize:13, color:C.red }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: add product form ───────────────────── */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:R.lg, padding:24, position:'sticky', top:0 }}>
          <h3 style={{ fontSize:16, fontWeight:800, marginBottom:20 }}>➕ Add New Product</h3>

          {/* Emoji picker */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, color:C.textMuted, fontWeight:700, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>
              Choose Icon
            </label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, maxHeight:120, overflowY:'auto' }}>
              {EMOJI_LIST.map(e => (
                <button key={e} onClick={()=>f('emoji',e)}
                  style={{ background: form.emoji===e?C.greenDim:C.card,
                           border:`1.5px solid ${form.emoji===e?C.green:C.border}`,
                           borderRadius:R.sm, padding:'6px 8px', cursor:'pointer',
                           fontSize:18, transition:'all 0.1s' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:C.textMuted, fontWeight:700, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>
              Product Name *
            </label>
            <input value={form.name} onChange={e=>f('name',e.target.value)}
              placeholder="e.g. Espresso" style={inputStyle}
              onFocus={e=>e.target.style.borderColor=C.green}
              onBlur={e=>e.target.style.borderColor=C.border} />
          </div>

          {/* Price */}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:C.textMuted, fontWeight:700, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>
              Price (£) *
            </label>
            <input type="number" step="0.01" min="0" value={form.price}
              onChange={e=>f('price',e.target.value)} placeholder="0.00"
              style={{...inputStyle, fontFamily:C.mono}}
              onFocus={e=>e.target.style.borderColor=C.green}
              onBlur={e=>e.target.style.borderColor=C.border} />
          </div>

          {/* Category */}
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:11, color:C.textMuted, fontWeight:700, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>
              Category *
            </label>
            {categories.length===0 ? (
              <div style={{ background:C.orangeDim, border:`1px solid ${C.orange}33`,
                            borderRadius:R.md, padding:'10px 14px', fontSize:13, color:C.orange }}>
                ⚠️ No categories yet — create one first
              </div>
            ) : (
              <select value={form.category} onChange={e=>f('category',e.target.value)}
                style={{...inputStyle, cursor:'pointer', color: form.category?C.textPrimary:C.textMuted}}>
                <option value="">Select a category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>

          {/* Preview */}
          {form.name && (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:R.md,
                          padding:'12px 16px', marginBottom:16,
                          display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:30 }}>{form.emoji}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:14 }}>{form.name}</div>
                <div style={{ color:C.green, fontFamily:C.mono, fontSize:13 }}>
                  {form.price ? fmt(parseFloat(form.price)||0) : '—'}
                </div>
                {form.category && (
                  <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>{form.category}</div>
                )}
              </div>
            </div>
          )}

          <button onClick={addProduct}
            style={{ width:'100%', background:C.green, color:C.bg, border:'none',
                     borderRadius:R.md, padding:'14px', fontWeight:800, fontSize:15,
                     cursor:'pointer', fontFamily:'inherit', transition:'filter 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.filter='brightness(1.1)'}
            onMouseLeave={e=>e.currentTarget.style.filter='brightness(1)'}>
            ✅ Add to Menu
          </button>
        </div>
      </div>

      {/* ── Category Manager Modal ──────────────────────── */}
      {showCatMgr && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
                      backdropFilter:'blur(6px)', display:'flex', alignItems:'center',
                      justifyContent:'center', zIndex:200 }}
             onClick={()=>setShowCatMgr(false)}>
          <div className="scale-in" onClick={e=>e.stopPropagation()}
               style={{ background:C.surface, border:`1px solid ${C.border}`,
                        borderRadius:R.xl, padding:32, width:440 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <h3 style={{ fontSize:18, fontWeight:800 }}>🏷️ Categories</h3>
                <p style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>{categories.length} categories</p>
              </div>
              <button onClick={()=>setShowCatMgr(false)}
                style={{ background:C.card, border:`1px solid ${C.border}`, color:C.textMuted,
                         borderRadius:R.md, padding:'8px 14px', cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>
                Done
              </button>
            </div>

            <div style={{ marginBottom:16 }}>
              {categories.length===0 && (
                <div style={{ padding:20, textAlign:'center', color:C.textFaint }}>No categories yet</div>
              )}
              {categories.map(cat => (
                <div key={cat} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                                        background:C.card, borderRadius:R.md, padding:'12px 16px', marginBottom:8 }}>
                  <div>
                    <span style={{ fontWeight:700, fontSize:14 }}>{cat}</span>
                    <span style={{ fontSize:11, color:C.textMuted, marginLeft:8 }}>
                      {products.filter(p=>p.category===cat).length} products
                    </span>
                  </div>
                  <button onClick={()=>deleteCategory(cat)}
                    style={{ background:C.redDim, border:'none', color:C.red,
                             borderRadius:R.sm, padding:'6px 12px', cursor:'pointer',
                             fontSize:12, fontWeight:700, fontFamily:'inherit' }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Add new category */}
            <div style={{ display:'flex', gap:8 }}>
              <input value={newCat} onChange={e=>setNewCat(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addCategory()}
                placeholder="New category name..."
                style={{ flex:1, background:C.card, border:`1.5px solid ${C.border}`,
                         borderRadius:R.md, padding:'11px 14px', color:C.textPrimary,
                         fontSize:14, outline:'none', fontFamily:'inherit' }}
                onFocus={e=>e.target.style.borderColor=C.green}
                onBlur={e=>e.target.style.borderColor=C.border} />
              <button onClick={addCategory}
                style={{ background:C.green, color:C.bg, border:'none',
                         borderRadius:R.md, padding:'11px 20px',
                         fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
