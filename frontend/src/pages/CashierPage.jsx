// src/pages/CashierPage.jsx — Main cashier screen: product grid + cart + payment flow
import { useState, useEffect } from 'react'
import { C, R } from '../styles/tokens.js'
import { calcTotals, genTxnId, downloadInvoice, fmt } from '../utils/helpers.js'
import CartPanel         from '../components/CartPanel.jsx'
import ProductGrid       from '../components/ProductGrid.jsx'
import PaymentModal      from '../components/PaymentModal.jsx'
import SuspendedDrawer   from '../components/SuspendedDrawer.jsx'

export default function CashierPage({
  products, categories, transactions, setTransactions,
  suspended, setSuspended, showToast, nextId,
}) {
  const [cart,         setCart]         = useState([])
  const [payModal,     setPayModal]     = useState(false)   // show payment modal
  const [payMethod,    setPayMethod]    = useState(null)    // 'card' | 'qr'
  const [payState,     setPayState]     = useState('idle')  // idle|processing|success
  const [lastTxn,      setLastTxn]      = useState(null)
  const [showSuspend,  setShowSuspend]  = useState(false)
  const [catFilter,    setCatFilter]    = useState('All')

  const { subtotal, tax, total } = calcTotals(cart)

  // ── Cart helpers ───────────────────────────────────────────
  function addItem(product) {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id)
      if (ex) return prev.map(i => i.id===product.id ? {...i,qty:i.qty+1} : i)
      return [...prev, {...product, qty:1}]
    })
  }

  function updateQty(id, delta) {
    setCart(prev => {
      const item = prev.find(i=>i.id===id)
      if (item && item.qty+delta < 1) return prev.filter(i=>i.id!==id)
      return prev.map(i => i.id===id ? {...i,qty:i.qty+delta} : i)
    })
  }

  function removeItem(id) { setCart(prev => prev.filter(i=>i.id!==id)) }
  function clearCart()    { setCart([]) }

  // ── Suspend / resume ───────────────────────────────────────
  function suspendOrder() {
    if (!cart.length) return
    setSuspended(prev => [...prev, {
      id: Date.now(), cart:[...cart], subtotal, tax, total,
      savedAt: new Date().toISOString(),
    }])
    setCart([])
    showToast(`🟡 Order suspended — ${cart.reduce((s,i)=>s+i.qty,0)} items saved`, 'warn')
  }

  function resumeOrder(order) {
    setCart(order.cart)
    setSuspended(prev => prev.filter(o=>o.id!==order.id))
    setShowSuspend(false)
    showToast('✅ Order resumed')
  }

  function deleteSuspended(id) {
    setSuspended(prev => prev.filter(o=>o.id!==id))
    showToast('🗑️ Suspended order deleted', 'error')
  }

  // ── Payment ────────────────────────────────────────────────
  function startPayment(method) {
    setPayMethod(method); setPayModal(true); setPayState('idle')
  }

  function confirmPayment() {
    setPayState('processing')
    setTimeout(() => {
      const txn = {
        id: genTxnId(transactions.length),
        time: new Date().toISOString(),
        method: payMethod === 'card' ? 'Card' : 'QR',
        subtotal, tax, total,
        items: cart.map(i=>({name:i.name,emoji:i.emoji,qty:i.qty,price:i.price})),
        status: 'success',
      }
      setTransactions(prev => [txn, ...prev])
      setLastTxn(txn)
      setPayState('success')
    }, 2800)
  }

  function closePayment() {
    if (payState==='success') {
      setCart([])
      showToast('✅ Payment complete — ready for next order')
    }
    setPayModal(false); setPayState('idle'); setPayMethod(null); setLastTxn(null)
  }

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>

      {/* LEFT: product grid */}
      <ProductGrid
        products={products}
        categories={categories}
        filter={catFilter}
        setFilter={setCatFilter}
        onAdd={addItem}
      />

      {/* RIGHT: cart */}
      <CartPanel
        cart={cart}
        subtotal={subtotal} tax={tax} total={total}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onClear={clearCart}
        onSuspend={suspendOrder}
        onPayCard={() => startPayment('card')}
        onPayQR={()   => startPayment('qr')}
        onShowSuspended={() => setShowSuspend(true)}
        suspendedCount={suspended.length}
      />

      {/* Payment modal */}
      {payModal && (
        <PaymentModal
          method={payMethod}
          total={total}
          payState={payState}
          lastTxn={lastTxn}
          cart={cart}
          subtotal={subtotal} tax={tax}
          onConfirm={confirmPayment}
          onClose={closePayment}
          onDownloadInvoice={() => { downloadInvoice(lastTxn); showToast('📄 Invoice downloaded') }}
          showToast={showToast}
        />
      )}

      {/* Suspended orders drawer */}
      {showSuspend && (
        <SuspendedDrawer
          orders={suspended}
          onResume={resumeOrder}
          onDelete={deleteSuspended}
          onClose={() => setShowSuspend(false)}
        />
      )}
    </div>
  )
}
