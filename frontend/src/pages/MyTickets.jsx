import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SideMenu from '../components/SideMenu'
import api from '../services/api'
import BackButton from '../components/BackButton'

export default function MyTickets() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tickets/me').then(res => {
      setTickets(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

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

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8">Mis entradas</h2>

        {tickets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">Todavía no compraste ninguna entrada</p>
            <button onClick={() => navigate('/events')}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition font-semibold">
              Explorar eventos
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TicketCard({ ticket, navigate }) {
  const [event, setEvent] = useState(null)
  const [primaryImage, setPrimaryImage] = useState(null)

  useEffect(() => {
    api.get(`/events/${ticket.event_id}`).then(res => setEvent(res.data))
    api.get(`/events/${ticket.event_id}/images`).then(res => {
      const primary = res.data.find(img => img.is_primary) || res.data[0]
      setPrimaryImage(primary)
    }).catch(() => {})
  }, [ticket.event_id])

  if (!event) return null

  const eventPassed = new Date(event.date) < new Date()

  return (
    <div
      onClick={() => navigate(`/events/${ticket.event_id}`)}
      className="bg-gray-900 rounded-2xl overflow-hidden flex cursor-pointer hover:ring-2 hover:ring-purple-500 transition">
      <div className="w-24 h-24 bg-gray-800 flex-shrink-0 overflow-hidden">
        {primaryImage ? (
          <img src={`http://127.0.0.1:8000${primaryImage.url}`} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-gray-600">🎟️</div>
        )}
      </div>
      <div className="p-4 flex-1 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-white">{event.title}</h3>
          <p className="text-gray-400 text-sm">{event.location}</p>
          <p className="text-gray-500 text-xs mt-1">{new Date(event.date).toLocaleDateString('es-AR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${eventPassed ? 'bg-gray-800 text-gray-400' : 'bg-purple-900 text-purple-300'}`}>
            {eventPassed ? 'Finalizado' : 'Próximo'}
          </span>
          <p className="text-purple-400 font-bold mt-2">${event.price.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}