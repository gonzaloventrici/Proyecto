import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SideMenu from '../components/SideMenu'
import api from '../services/api'

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
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition text-sm">
          ← Volver
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header del organizador */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8 flex gap-6 items-center">
          <div style={{position:'relative', width:'80px', height:'80px', flexShrink:0}}>
            <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:'bold', color:'white', overflow:'hidden'}}>
              {organizer.avatar_url ? (
                <img src={`http://127.0.0.1:8000${organizer.avatar_url}`} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />
              ) : 'O'}
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
            <h2 className="text-2xl font-bold mb-1">{organizer.producer_name}</h2>
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

        {/* Eventos */}
        <h3 className="text-xl font-bold mb-4">Eventos</h3>
        {organizer.events.length === 0 ? (
          <p className="text-gray-400">Este organizador no tiene eventos publicados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizer.events.map(event => (
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
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-purple-400 font-bold text-sm">${event.price.toLocaleString()}</span>
                    <span className="text-yellow-400 text-sm">⭐ {event.average_rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}