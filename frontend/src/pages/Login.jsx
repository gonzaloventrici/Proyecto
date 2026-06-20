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
      navigate('/events')
    } catch {
      setError('Email o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-md px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-purple-400 mb-3">Wharty</h1>
          <p className="text-gray-400 text-lg">La salida que vos necesitas, al alcance de tu mano.</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-1">Bienvenido</h2>
          <p className="text-gray-500 text-sm mb-6">Ingresá tu cuenta para continuar</p>

          {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none w-full"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Contraseña</label>
              <input
                type="password"
                placeholder="••••"
                className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none w-full"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition mt-2">
              Iniciar sesión
            </button>
          </form>

          <p className="text-gray-500 mt-6 text-center text-sm">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-purple-400 hover:underline font-semibold">
              Registrate acá
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}