// src/components/Toast.jsx — Animated notification at the bottom of the screen
import { C, R } from '../styles/tokens.js'

const COLORS = {
  success: { bg: C.green,  text: C.bg      },
  error:   { bg: C.red,    text: '#fff'     },
  warn:    { bg: C.orange, text: C.bg       },
  info:    { bg: C.blue,   text: C.bg       },
}

export default function Toast({ msg, type='success' }) {
  const { bg, text } = COLORS[type] || COLORS.success
  return (
    <div className="slide-up" style={{
      position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
      background:bg, color:text,
      padding:'11px 24px', borderRadius:R.pill,
      fontWeight:800, fontSize:14, zIndex:400,
      boxShadow:'0 8px 28px rgba(0,0,0,0.4)',
      whiteSpace:'nowrap', pointerEvents:'none',
    }}>
      {msg}
    </div>
  )
}
