import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

function parseToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { token, isOrganizer: payload.is_organizer, userId: payload.sub }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    return token ? parseToken(token) : null
  })

  const login = (token) => {
    localStorage.setItem('token', token)
    setUser(parseToken(token))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}