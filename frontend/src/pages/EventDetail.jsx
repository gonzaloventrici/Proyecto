import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function EventDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ rating: 5, comment: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get(`/events/${id}`).then(res => setEvent(res.data))
    api.get(`/reviews/${id}`).then(res => setReviews(res.data))
  }, [id])

  const handleTicket = async () => {
    try {
      await api.post('/tickets/', { event_id: parseInt(id), payment_id: 'SIMULADO_' + Date.now() })
      setMessage('✅ Entrada comprada correctamente')
    } catch {
      setMessage('❌ Error al comprar la entrada')
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    try {
      await api.post('/reviews/', { event_id: parseInt(id), ...form })
      const res = await api.get(`/reviews/${id}`)
      setReviews(res.data)
      setMessage('✅ Reseña publicada')
    } catch {
      setMessage('❌ Necesitás haber comprado una entrada para reseñar')
    }
  }

  if (!event) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-gray-900 rounded-2xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-gray-400 mb-4">{event.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div><span className="text-gray-500">Ubicación</span><p>{event.location}</p></div>
            <div><span className="text-gray-500">Fecha</span><p>{new Date(event.date).toLocaleDateString()}</p></div>
            <div><span className="text-gray-500">Precio</span><p className="text-purple-400 font-bold">${event.price.toLocaleString()}</p></div>
            <div><span className="text-gray-500">Rating</span><p className="text-yellow-400">⭐ {event.average_rating.toFixed(1)}</p></div>
          </div>
          {user && (
            <button onClick={handleTicket} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition w-full">
              Comprar entrada
            </button>
          )}
          {message && <p className="mt-3 text-center text-sm">{message}</p>}
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Reseñas ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400">Todavía no hay reseñas.</p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="border-b border-gray-800 py-4">
                <div className="flex justify-between mb-1">
                  <span className="text-yellow-400">{'⭐'.repeat(Math.round(r.rating))}</span>
                  <span className="text-gray-500 text-sm">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-300">{r.comment}</p>
              </div>
            ))
          )}
        </div>

        {user && (
          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4">Dejar una reseña</h2>
            <form onSubmit={handleReview} className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Calificación</label>
                <select
                  className="bg-gray-800 text-white rounded-lg px-4 py-3 w-full outline-none"
                  value={form.rating}
                  onChange={e => setForm({...form, rating: parseFloat(e.target.value)})}
                >
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                </select>
              </div>
              <textarea
                placeholder="Contá tu experiencia..."
                className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none resize-none h-28"
                value={form.comment}
                onChange={e => setForm({...form, comment: e.target.value})}
              />
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition">
                Publicar reseña
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}