import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const res = await api.post('/auth/login', form)
    console.log('respuesta login:', res.data)
    login(res.data.access_token)
    navigate('/')
  } catch (err) {
    console.log('error login:', err)
    setError('Email o contraseña incorrectos')
  }
}

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Iniciar sesión</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition">
            Entrar
          </button>
        </form>
        <p className="text-gray-400 mt-4 text-center">
          ¿No tenés cuenta? <Link to="/register" className="text-purple-400 hover:underline">Registrate</Link>
        </p>
      </div>
    </div>
  )
}