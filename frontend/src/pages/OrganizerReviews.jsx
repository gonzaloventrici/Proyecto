import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SideMenu from '../components/SideMenu'
import BackButton from '../components/BackButton'
import api from '../services/api'

export default function OrganizerReviews() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [organizer, setOrganizer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/auth/organizer/${id}`).then(res => {
      setOrganizer(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Cargando...</div>
  if (!organizer) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">No encontrado</div>

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
        <h2 className="text-3xl font-bold mb-2">Reseñas de {organizer.producer_name}</h2>
        <p className="text-gray-400 mb-8">{organizer.total_reviews} reseñas · ⭐ {organizer.avg_rating} promedio</p>

        {organizer.reviews.length === 0 ? (
          <p className="text-gray-400">Este organizador no tiene reseñas todavía.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {organizer.reviews.map(r => (
          <div
            key={r.id}
            className="bg-gray-900 rounded-2xl p-6 cursor-pointer hover:ring-2 hover:ring-purple-500 transition"
            onClick={() => navigate(`/events/${r.event_id}`)}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-purple-400 text-sm font-semibold mb-1">{r.event_title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">{'⭐'.repeat(Math.round(r.rating))}</span>
                  {r.user_name && (
                      <span
                        className="text-gray-500 text-base hover:text-purple-400 transition cursor-pointer"
                        onClick={e => { e.stopPropagation(); navigate(`/user/${r.user_id}`) }}>
                        {' - '} {r.user_name}
                      </span>
                    )}
                </div>
              </div>
              <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString('es-AR')}</span>
            </div>
            <p className="text-gray-300 mt-2">{r.comment}</p>
          </div>
        ))}
          </div>
        )}
      </div>
    </div>
  )
}