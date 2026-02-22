// src/components/ProductGrid.jsx — Left panel: category filters + product cards
import { C, R } from '../styles/tokens.js'
import { fmt } from '../utils/helpers.js'

export default function ProductGrid({ products, categories, filter, setFilter, onAdd }) {
  const allCategories = ['All', ...categories]
  const visible = (filter==='All' ? products : products.filter(p=>p.category===filter))
                  .filter(p=>p.active)

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column',
                  padding:'18px 18px 18px 20px', overflow:'hidden' }}>

      {/* Category filter pills */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', flexShrink:0 }}>
        {allCategories.map(c => (
          <button key={c} onClick={()=>setFilter(c)}
            style={{ background: filter===c?C.green:C.card,
                     color:      filter===c?C.bg:C.textMuted,
                     border:`1px solid ${filter===c?C.green:C.border}`,
                     borderRadius:R.pill, padding:'6px 16px',
                     fontWeight:700, fontSize:12, cursor:'pointer',
                     fontFamily:'inherit', transition:'all 0.15s' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Product grid — scrollable */}
      <div style={{ flex:1, overflowY:'auto',
                    display:'grid',
                    gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))',
                    gap:12, alignContent:'start' }}>
        {visible.length===0 && (
          <div style={{ gridColumn:'1/-1', textAlign:'center',
                        padding:40, color:C.textFaint }}>
            No products in this category
          </div>
        )}
        {visible.map(p => (
          <div key={p.id}
            onClick={() => onAdd(p)}
            className="fade-in"
            style={{ background:C.card, border:`1.5px solid ${C.border}`,
                     borderRadius:R.lg, padding:'18px 12px', cursor:'pointer',
                     textAlign:'center', transition:'all 0.15s', userSelect:'none' }}
            onMouseEnter={e=>{
              e.currentTarget.style.borderColor=C.green
              e.currentTarget.style.transform='translateY(-2px)'
              e.currentTarget.style.boxShadow=`0 6px 20px ${C.greenDim}`
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.borderColor=C.border
              e.currentTarget.style.transform='translateY(0)'
              e.currentTarget.style.boxShadow='none'
            }}>
            <div style={{ fontSize:36, marginBottom:8 }}>{p.emoji}</div>
            <div style={{ fontSize:12, fontWeight:700, color:C.textPrimary,
                          marginBottom:5, lineHeight:1.3 }}>{p.name}</div>
            <div style={{ fontSize:14, fontWeight:800, color:C.green,
                          fontFamily:C.mono }}>{fmt(p.price)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
