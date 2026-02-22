// src/context/AuthContext.jsx — Login state shared across the whole app
import { createContext, useContext, useState } from 'react'
import { DEFAULT_USERS } from '../data/seedData.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null)   // null = not logged in
  const [users, setUsers] = useState(DEFAULT_USERS)

  // Returns null on success, or an error string
  function login(username, password) {
    const found = users.find(u => u.username === username && u.password === password)
    if (!found) return 'Invalid username or password'
    setUser(found)
    return null
  }

  function logout() { setUser(null) }

  // Owner can add new staff / owner accounts
  function addUser(newUser) {
    const id = users.length + 1
    setUsers(prev => [...prev, { ...newUser, id }])
  }

  function deleteUser(id) {
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  // Permission helpers
  const isOwner = user?.role === 'owner'
  const isStaff = user?.role === 'staff'

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, deleteUser, isOwner, isStaff }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use anywhere: const { user, isOwner } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}
