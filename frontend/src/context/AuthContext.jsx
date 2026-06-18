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
  const userData = localStorage.getItem('user_data')
  if (token && userData) return JSON.parse(userData)
  return token ? parseToken(token) : null
})

const login = async (token) => {
  localStorage.setItem('token', token)
  const payload = parseToken(token)
  setUser(payload)
  try {
    const res = await fetch('http://127.0.0.1:8000/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    const fullUser = {
      ...payload,
      avatar_url: data.avatar_url,
      name: data.is_organizer ? data.producer_name : data.name
    }
    setUser(fullUser)
    localStorage.setItem('user_data', JSON.stringify(fullUser))
  } catch {}
}

  const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user_data')
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