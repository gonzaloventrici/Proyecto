import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SideMenu from '../components/SideMenu'
import BackButton from '../components/BackButton'
import api from '../services/api'

export default function OrganizerEvents() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [organizer, setOrganizer] = useState(null)
  const [eventImages, setEventImages] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/auth/organizer/${id}`).then(res => {
      setOrganizer(res.data)
      setLoading(false)
      res.data.events.forEach(event => {
        api.get(`/events/${event.id}/images`).then(imgRes => {
          const primary = imgRes.data.find(img => img.is_primary) || imgRes.data[0]
          if (primary) setEventImages(prev => ({ ...prev, [event.id]: primary.url }))
        }).catch(() => {})
      })
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Cargando...</div>
  if (!organizer) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">No encontrado</div>

  const now = new Date()
  const upcoming = organizer.events.filter(e => new Date(e.date) >= now)
  const past = organizer.events.filter(e => new Date(e.date) < now)

  const EventGrid = ({ events }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {events.map(event => (
        <div
          key={event.id}
          onClick={() => navigate(`/events/${event.id}`)}
          className="bg-gray-900 rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition">
          <div className="h-36 bg-gray-800 overflow-hidden flex items-center justify-center">
            {eventImages[event.id] ? (
              <img src={`http://127.0.0.1:8000${eventImages[event.id]}`} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-gray-600">📷</span>
            )}
          </div>
          <div className="p-4">
            <h4 className="font-semibold text-white mb-1">{event.title}</h4>
            <p className="text-gray-400 text-sm">{event.location}</p>
            <p className="text-gray-500 text-xs mt-1">{new Date(event.date).toLocaleDateString('es-AR', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-purple-400 font-bold text-sm">${event.price.toLocaleString()}</span>
              <span className="text-yellow-400 text-sm">⭐ {event.average_rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <nav className="bg-gray-900 px-6 py-4 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          {user && (
            <button onClick={() => setMenuOpen(true)} style={{width:'38px', height:'38px', borderRadius:'8px', background:'transparent', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:'5px', padding:'4px'}}>
              <span style={{display:'block', width:'22px', height:'2px', background:'#a78bfa', borderRadius:'2px'}}></span>
              <span style={{display:'block', width:'22px', height:'2px', background:'#a78bfa', borderRadius:'2px'}}></span>
              <span style={{display:'block', width:'22px', height:'2px', background:'#a78bfa', borderRadius:'2px'}}></span>
            </button>
          )}
          <h1 className="text-xl font-bold text-purple-400 cursor-pointer" onClick={() => navigate('/events')}>Wharty</h1>
        </div>
        <BackButton />
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-2">Eventos de {organizer.producer_name}</h2>
        <p className="text-gray-400 mb-8">{organizer.total_events} eventos en total</p>

        {upcoming.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Próximos</h3>
            <EventGrid events={upcoming} />
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-400">Ya ocurridos</h3>
            <EventGrid events={past} />
          </div>
        )}

        {organizer.total_events === 0 && (
          <p className="text-gray-400">Este organizador no tiene eventos publicados.</p>
        )}
      </div>
    </div>
  )
}