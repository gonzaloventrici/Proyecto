import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', is_organizer: false })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/auth/register', form)
      navigate('/login')
    } catch {
      setError('Error al registrarse, intentá con otro email')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Crear cuenta</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre"
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
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
          <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_organizer}
              onChange={e => setForm({...form, is_organizer: e.target.checked})}
              className="w-4 h-4"
            />
            Soy organizador de eventos
          </label>
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition">
            Registrarse
          </button>
        </form>
        <p className="text-gray-400 mt-4 text-center">
          ¿Ya tenés cuenta? <Link to="/login" className="text-purple-400 hover:underline">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}