import { getImageUrl } from '../api';
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SideMenu from '../components/SideMenu'
import BackButton from '../components/BackButton'
import api from '../services/api'

export default function UserProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const isOwner = user?.userId === id

  useEffect(() => {
    api.get(`/auth/user/${id}`).then(res => {
      setProfile(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Cargando...</div>
  if (!profile) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Usuario no encontrado</div>

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

        {/* Header */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8 flex gap-6 items-center">
        <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:'bold', color:'white', overflow:'hidden', flexShrink:0}}>
            {profile.avatar_url ? (
            <img src={getImageUrl(profile.avatar_url)} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />
            ) : (
            (profile.name?.[0] || 'F').toUpperCase()
            )}
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <span className="bg-purple-900 text-purple-300 text-xs px-3 py-1 rounded-full font-semibold">Fiestero</span>
            </div>
            <p className="text-gray-500 text-sm mb-3">{profile.total_reviews} reseñas</p>
            {isOwner && (
            <button
                onClick={() => navigate('/fiestero-profile')}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition">
                Editar perfil
            </button>
            )}
        </div>
        </div>

        {/* Reseñas */}
        <h3 className="text-xl font-bold mb-4">Reseñas</h3>
        {profile.reviews.length === 0 ? (
          <p className="text-gray-400">Aún no dejó ninguna reseña.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {profile.reviews.map(r => (
              <div
                key={r.id}
                className="bg-gray-900 rounded-2xl p-6 cursor-pointer hover:ring-2 hover:ring-purple-500 transition"
                onClick={() => navigate(`/events/${r.event_id}`)}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-purple-400 text-sm font-semibold mb-1">{r.event_title}</p>
                    <span className="text-yellow-400">{'⭐'.repeat(Math.round(r.rating))}</span>
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