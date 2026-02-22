// src/App.jsx — Root: wraps everything in AuthProvider, shows Login or main shell
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import LoginPage  from './pages/LoginPage.jsx'
import MainShell  from './pages/MainShell.jsx'

function Inner() {
  const { user } = useAuth()
  return user ? <MainShell /> : <LoginPage />
}

export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  )
}
