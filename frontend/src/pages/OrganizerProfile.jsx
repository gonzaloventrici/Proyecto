import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SideMenu from '../components/SideMenu'
import api from '../services/api'
import BackButton from '../components/BackButton'
// 1. Importamos la función utilitaria
import { getImageUrl } from "../services/api";

export default function OrganizerProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [organizer, setOrganizer] = useState(null)
  const [eventImages, setEventImages] = useState({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saveSuccess, setSaveSuccess] = useState('')
  const [saveError, setSaveError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isOwner = user?.userId === id

  useEffect(() => {
    api.get(`/auth/organizer/${id}`).then(res => {
      setOrganizer(res.data)
      setLoading(false)
      res.data.events.forEach(event => {
        api.get(`/events/${event.id}/images`).then(imgRes => {
          const primary = imgRes.data.find(img => img.is_primary) || imgRes.data[0]
          if (primary) {
            setEventImages(prev => ({ ...prev, [event.id]: primary.url }))
          }
        }).catch(() => {})
      })
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Cargando...</div>
  if (!organizer) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Organizador no encontrado</div>

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

        {/* Header del organizador */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8 flex gap-6 items-center">
          <div style={{position:'relative', width:'80px', height:'80px', flexShrink:0}}>
            <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:'bold', color:'white', overflow:'hidden'}}>
              {organizer.avatar_url ? (
                /* 2. Reemplazamos la url del avatar por el helper */
                <img src={getImageUrl(organizer.avatar_url)} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />
              ) : (
                (organizer.producer_name?.[0] || 'O').toUpperCase()
              )}
            </div>
            {isOwner && (
              <label style={{position:'absolute', bottom:0, right:0, width:'26px', height:'26px', borderRadius:'50%', background:'#4c1d95', border:'2px solid #111827', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px'}}>
                ✏️
                <input type="file" accept="image/*" style={{display:'none'}} onChange={async (e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  const formData = new FormData()
                  formData.append('file', file)
                  const res = await api.post('/auth/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                  setOrganizer({ ...organizer, avatar_url: res.data.avatar_url })
                  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
                  localStorage.setItem('user_data', JSON.stringify({ ...userData, avatar_url: res.data.avatar_url }))
                }} />
              </label>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold">{organizer.producer_name}</h2>
              <span className="bg-purple-900 text-purple-300 text-xs px-3 py-1 rounded-full font-semibold">Organizador</span>
            </div>
            {isOwner && organizer.avatar_url && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400 hover:text-red-300 text-xs mb-2 transition">
                Eliminar foto
              </button>
            )}
            <div className="flex gap-6 mt-2">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">{organizer.total_events}</div>
                <div className="text-gray-500 text-xs">Eventos</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">⭐ {organizer.avg_rating}</div>
                <div className="text-gray-500 text-xs">Rating promedio</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-300">{organizer.total_reviews}</div>
                <div className="text-gray-500 text-xs">Reseñas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón editar */}
        {isOwner && !editing && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setForm({
                  producer_name: organizer.producer_name,
                  cuit: organizer.cuit,
                  razon_social: organizer.razon_social,
                  corporate_email: organizer.corporate_email,
                  phone: organizer.phone,
                  cbu: organizer.cbu
                })
                setEditing(true)
              }}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition">
              Editar perfil
            </button>
          </div>
        )}

        {/* Formulario edición */}
        {isOwner && editing && (
          <div className="bg-gray-900 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Editar perfil</h3>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-white text-sm">Cancelar</button>
            </div>
            {saveSuccess && <p className="text-green-400 mb-4 text-sm">{saveSuccess}</p>}
            {saveError && <p className="text-red-400 mb-4 text-sm">{saveError}</p>}
            <form onSubmit={async (e) => {
              e.preventDefault()
              try {
                await api.put('/auth/me', form)
                setSaveSuccess('Perfil actualizado correctamente')
                setOrganizer({ ...organizer, ...form })
                setEditing(false)
              } catch {
                setSaveError('Error al actualizar')
              }
            }} className="flex flex-col gap-4">
              <input type="text" placeholder="Nombre de la Productora"
                className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                value={form.producer_name || ''} onChange={e => setForm({...form, producer_name: e.target.value})} />
              <input type="text" placeholder="CUIT / CUIL"
                className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                value={form.cuit || ''} onChange={e => setForm({...form, cuit: e.target.value})} />
              <input type="text" placeholder="Razón Social"
                className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                value={form.razon_social || ''} onChange={e => setForm({...form, razon_social: e.target.value})} />
              <input type="email" placeholder="Email corporativo"
                className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                value={form.corporate_email || ''} onChange={e => setForm({...form, corporate_email: e.target.value})} />
              <input type="tel" placeholder="Teléfono"
                className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
              <input type="text" placeholder="CBU / CVU"
                className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                value={form.cbu || ''} onChange={e => setForm({...form, cbu: e.target.value})} />
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition">
                Guardar cambios
              </button>
            </form>
          </div>
        )}

        {/* Reseñas */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Reseñas</h3>
          {organizer.reviews?.length > 5 && (
            <button
              onClick={() => navigate(`/organizer/${id}/reviews`)}
              className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition">
              Ver todas ({organizer.reviews.length})
            </button>
          )}
        </div>

        {!organizer.reviews || organizer.reviews.length === 0 ? (
          <p className="text-gray-400 mb-8">Aún no hay reseñas.</p>
        ) : (
          <div className="flex flex-col gap-4 mb-10">
            {organizer.reviews.slice(0, 5).map(r => (
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

        {/* Eventos */}
        <div className="flex justify-between items-center mb-4 mt-4">
          <h3 className="text-xl font-bold">Eventos</h3>
          {organizer.events.length > 5 && (
            <button
              onClick={() => navigate(`/organizer/${id}/events`)}
              className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition">
              Ver todos ({organizer.events.length})
            </button>
          )}
        </div>

        {(() => {
          const now = new Date()
          const upcoming = organizer.events.filter(e => new Date(e.date) >= now).slice(0, 5)
          const past = organizer.events.filter(e => new Date(e.date) < now).slice(0, 5 - upcoming.length)
          const shown = [...upcoming, ...past].slice(0, 5)

          return organizer.events.length === 0 ? (
            <p className="text-gray-400 mb-8">Este organizador no tiene eventos publicados.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {shown.map(event => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="bg-gray-900 rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition">
                  <div className="h-36 bg-gray-800 overflow-hidden flex items-center justify-center">
                    {eventImages[event.id] ? (
                      /* 3. Reemplazamos la url de la portada del evento por el helper */
                      <img src={getImageUrl(eventImages[event.id])} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-gray-600">📷</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                    <p className="text-gray-400 text-sm">{event.location}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-purple-400 font-bold text-sm">${event.price.toLocaleString()}</span>
                      <span className="text-yellow-400 text-sm">⭐ {event.average_rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}

      </div>
      {showDeleteConfirm && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifycontent:'center', zIndex:60}}>
          <div style={{background:'#111827', borderRadius:'16px', padding:'32px', maxWidth:'340px', width:'100%', margin:'0 16px'}}>
            <h2 style={{color:'white', fontSize:'18px', fontWeight:'bold', marginBottom:'8px'}}>Eliminar foto</h2>
            <p style={{color:'#9ca3af', marginBottom:'24px'}}>¿Seguro que querés eliminar tu foto de perfil?</p>
            <div style={{display:'flex', gap:'12px'}}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{flex:1, padding:'12px', borderRadius:'8px', border:'1px solid #374151', color:'#d1d5db', background:'transparent', cursor:'pointer'}}>
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await api.delete('/auth/me/avatar')
                  setOrganizer({ ...organizer, avatar_url: null })
                  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
                  localStorage.setItem('user_data', JSON.stringify({ ...userData, avatar_url: null }))
                  setShowDeleteConfirm(false)
                }}
                style={{flex:1, padding:'12px', borderRadius:'8px', background:'#dc2626', color:'white', fontWeight:'600', cursor:'pointer', border:'none'}}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}