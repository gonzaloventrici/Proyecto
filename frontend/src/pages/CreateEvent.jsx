import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    price: '',
    capacity: '',
    image_url: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/events/', {
        ...form,
        price: parseFloat(form.price),
        capacity: parseInt(form.capacity),
        date: new Date(form.date).toISOString()
      })
      navigate('/events')
    } catch {
      setError('Error al crear el evento. Verificá que todos los campos estén completos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-400">EventApp</h1>
        <button onClick={() => navigate('/events')} className="text-gray-400 hover:text-white transition">
          ← Volver
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8">Crear nuevo evento</h2>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre del evento"
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            required
          />
          <textarea
            placeholder="Descripción"
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none resize-none h-28"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
          />
          <input
            type="text"
            placeholder="Ubicación"
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
            value={form.location}
            onChange={e => setForm({...form, location: e.target.value})}
            required
          />
          <input
            type="datetime-local"
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
            value={form.date}
            onChange={e => setForm({...form, date: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Precio"
              className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
              value={form.price}
              onChange={e => setForm({...form, price: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Capacidad"
              className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
              value={form.capacity}
              onChange={e => setForm({...form, capacity: e.target.value})}
              required
            />
          </div>
          <input
            type="text"
            placeholder="URL de imagen (opcional)"
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
            value={form.image_url}
            onChange={e => setForm({...form, image_url: e.target.value})}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear evento'}
          </button>
        </form>
      </div>
    </div>
  )
}