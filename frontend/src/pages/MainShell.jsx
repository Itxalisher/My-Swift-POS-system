// src/pages/MainShell.jsx — After login: holds global state + renders the active page
import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import TopBar     from '../components/TopBar.jsx'
import Toast      from '../components/Toast.jsx'
import CashierPage      from './CashierPage.jsx'
import TransactionsPage from './TransactionsPage.jsx'
import ProductsPage     from './ProductsPage.jsx'
import UsersPage        from './UsersPage.jsx'
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, MOCK_TRANSACTIONS } from '../data/seedData.js'

export default function MainShell() {
  const { isOwner } = useAuth()

  // ── Active page ────────────────────────────────────────────
  const [screen, setScreen] = useState('cashier')

  // ── Global data ────────────────────────────────────────────
  const [products,     setProducts]     = useState(INITIAL_PRODUCTS)
  const [categories,   setCategories]   = useState(INITIAL_CATEGORIES)
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS)
  const [suspended,    setSuspended]    = useState([])   // on-hold orders
  const nextId = useRef(INITIAL_PRODUCTS.length + 1)

  // ── Toast ──────────────────────────────────────────────────
  const [toast, setToast] = useState(null)
  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', width:'100vw', overflow:'hidden' }}>

      <TopBar
        screen={screen}
        setScreen={setScreen}
        suspendedCount={suspended.length}
        isOwner={isOwner}
      />

      <div style={{ flex:1, overflow:'hidden' }}>
        {screen === 'cashier' && (
          <CashierPage
            products={products}
            categories={categories}
            transactions={transactions}
            setTransactions={setTransactions}
            suspended={suspended}
            setSuspended={setSuspended}
            showToast={showToast}
            nextId={nextId}
          />
        )}
        {screen === 'transactions' && (
          <TransactionsPage
            transactions={transactions}
            showToast={showToast}
          />
        )}
        {screen === 'products' && isOwner && (
          <ProductsPage
            products={products}
            setProducts={setProducts}
            categories={categories}
            setCategories={setCategories}
            nextId={nextId}
            showToast={showToast}
          />
        )}
        {screen === 'users' && isOwner && (
          <UsersPage showToast={showToast} />
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
