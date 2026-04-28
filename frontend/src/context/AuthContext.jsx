import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)       // undefined = noch nicht geprüft
  const [setupRequired, setSetupRequired] = useState(false)

  useEffect(() => {
    // Erst Setup-Status prüfen, dann Auth-Status
    fetch('/api/setup/status')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.setupRequired) {
          setSetupRequired(true)
          setUser(null)
          return
        }
        return fetch('/api/auth/me', { credentials: 'include' })
          .then(r => r.ok ? r.json() : null)
          .then(me => setUser(me))
      })
      .catch(() => setUser(null))
  }, [])

  const login = async (email, password) => {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    if (!r.ok) {
      const err = await r.json()
      throw new Error(err.error)
    }
    const data = await r.json()
    setSetupRequired(false)
    setUser(data)
    return data
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, setupRequired, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
