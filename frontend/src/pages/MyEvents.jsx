import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SideMenu from '../components/SideMenu'
import api from '../services/api'
import BackButton from '../components/BackButton'

export default function MyEvents() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/events/my-events')
      .then(res => { setEvents(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (eventId) => {
    if (!window.confirm('¿Seguro que querés eliminar este evento?')) return
    try {
      await api.delete(`/events/${eventId}`)
      setEvents(events.filter(e => e.id !== eventId))
    } catch {
      alert('Error al eliminar el evento')
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <nav className="bg-gray-900 px-6 py-4 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <button onClick={() => setMenuOpen(true)} style={{width:'38px', height:'38px', borderRadius:'8px', background:'transparent', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:'5px', padding:'4px'}}>
            <span style={{display:'block', width:'22px', height:'2px', background:'#a78bfa', borderRadius:'2px'}}></span>
            <span style={{display:'block', width:'22px', height:'2px', background:'#a78bfa', borderRadius:'2px'}}></span>
            <span style={{display:'block', width:'22px', height:'2px', background:'#a78bfa', borderRadius:'2px'}}></span>
          </button>
          <h1 className="text-xl font-bold text-purple-400 cursor-pointer" onClick={() => navigate('/events')}>Wharty</h1>
        </div>
        <BackButton />
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Mis eventos</h2>
          <button
            onClick={() => navigate('/events/create')}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition text-sm font-semibold">
            + Crear evento
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">Todavía no publicaste ningún evento</p>
            <button
              onClick={() => navigate('/events/create')}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition font-semibold">
              Crear mi primer evento
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map(event => (
              <div key={event.id} className="bg-gray-900 rounded-2xl p-6 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center flex-shrink-0">
                    {event.image_url ? (
                      <img src={event.image_url.startsWith('http') ? event.image_url : `http://127.0.0.1:8000${event.image_url}`} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🎉</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <p className="text-gray-400 text-sm">{event.location}</p>
                    <div className="flex gap-4 mt-1 items-center">
                      <span className="text-purple-400 text-sm font-bold">${event.price.toLocaleString()}</span>
                      <span className="text-yellow-400 text-sm">⭐ {event.average_rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">{new Date(event.date).toLocaleDateString()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${event.tickets_sold >= event.capacity ? 'bg-red-900 text-red-300' : 'bg-gray-800 text-gray-300'}`}>
                        {event.tickets_sold} / {event.capacity} entradas
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/events/edit/${event.id}`)}
                    className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition text-sm border border-gray-700">
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="bg-red-900 hover:bg-red-800 px-4 py-2 rounded-lg transition text-sm border border-red-800 text-red-300">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}