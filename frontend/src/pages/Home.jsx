import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Home() {
  const [events, setEvents] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/events/').then(res => setEvents(res.data))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {showConfirm && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}}>
          <div style={{background:'#111827', borderRadius:'16px', padding:'32px', maxWidth:'380px', width:'100%', margin:'0 16px'}}>
            <h2 style={{color:'white', fontSize:'20px', fontWeight:'bold', marginBottom:'8px'}}>Cerrar sesión</h2>
            <p style={{color:'#9ca3af', marginBottom:'24px'}}>¿Seguro que querés cerrar sesión?</p>
            <div style={{display:'flex', gap:'12px'}}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{flex:1, padding:'12px', borderRadius:'8px', border:'1px solid #374151', color:'#d1d5db', background:'transparent', cursor:'pointer'}}>
                Cancelar
              </button>
              <button
                onClick={() => { setShowConfirm(false); logout(); }}
                style={{flex:1, padding:'12px', borderRadius:'8px', background:'#dc2626', color:'white', fontWeight:'600', cursor:'pointer', border:'none'}}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-gray-900 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-400">EventApp</h1>
        <div className="flex gap-4 items-center">
          {user?.isOrganizer && (
            <Link to="/events/create" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition text-sm font-semibold">
              + Crear evento
            </Link>
          )}
          {user ? (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowConfirm(true)
              }}
              className="text-gray-400 hover:text-white transition">
              Cerrar sesión
            </button>
          ) : (
            <>
              <Link to="/login" className="text-gray-400 hover:text-white transition">Iniciar sesión</Link>
              <Link to="/register" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition">Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8">Eventos disponibles</h2>
        {events.length === 0 ? (
          <p className="text-gray-400">No hay eventos disponibles por ahora.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Link to={`/events/${event.id}`} key={event.id}>
                <div className="bg-gray-900 rounded-2xl overflow-hidden hover:ring-2 hover:ring-purple-500 transition">
                  <div className="bg-gray-800 h-40 flex items-center justify-center text-4xl">🎉</div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{event.location}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-400 font-bold">${event.price.toLocaleString()}</span>
                      <span className="text-yellow-400 text-sm">⭐ {event.average_rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}