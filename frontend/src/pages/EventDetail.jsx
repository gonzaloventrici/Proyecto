import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CheckoutModal from '../components/CheckoutModal'
import api from '../services/api'
import BackButton from '../components/BackButton'
import SideMenu from '../components/SideMenu'

export default function EventDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [images, setImages] = useState([])
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ rating: 5, comment: '' })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [organizer, setOrganizer] = useState(null)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    api.get(`/events/${id}`).then(res => setEvent(res.data))
    api.get(`/events/${id}/images`).then(res => setImages(res.data))
    api.get(`/reviews/${id}`).then(res => setReviews(res.data))
    if (user) {
      api.get('/reviews/me').then(res => {
        const reviewed = res.data.some(r => r.event_id === parseInt(id))
        setAlreadyReviewed(reviewed)
      }).catch(() => {})
    }
  }, [id])

  useEffect(() => {
    if (event?.organizer_id) {
      api.get(`/auth/organizer/${event.organizer_id}`).then(res => setOrganizer(res.data)).catch(() => {})
    }
  }, [event])

  const handleReview = async (e) => {
    e.preventDefault()
    if (!form.comment.trim()) {
      setCommentError('Por favor escribí tu experiencia antes de publicar')
      return
    }
    try {
      await api.post('/reviews/', { event_id: parseInt(id), ...form })
      const res = await api.get(`/reviews/${id}`)
      setReviews(res.data)
      setSuccess('✅ Reseña publicada')
      setError('')
      setAlreadyReviewed(true)
    } catch (err) {
      const msg = err.response?.data?.detail
      if (msg === 'Ya reseñaste este evento') {
        setAlreadyReviewed(true)
      } else {
        setError('❌ Error al publicar la reseña')
      }
      setSuccess('')
    }
  }

  if (!event) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Cargando...</div>

  const eventPassed = new Date(event.date) < new Date()
  const primaryImage = images.find(img => img.is_primary) || images[0]

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
      {showCheckout && (
        <CheckoutModal
          event={event}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {}}
        />
      )}

      <div className="max-w-3xl mx-auto px-6 py-10">

        <div className="bg-gray-900 rounded-2xl overflow-hidden mb-8">
          {primaryImage && (
            <div className="h-56 overflow-hidden">
              <img
                src={primaryImage.url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-gray-400 mb-4">{event.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div><span className="text-gray-500">Ubicación</span><p>{event.location}</p></div>
              <div>
                <span className="text-gray-500">Fecha y Hora</span>
                <p>
                  {new Date(event.date).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} hs
                </p>
              </div>
              <div><span className="text-gray-500">Precio</span><p className="text-purple-400 font-bold">${event.price.toLocaleString()}</p></div>
              <div><span className="text-gray-500">Rating</span><p className="text-yellow-400">⭐ {event.average_rating.toFixed(1)}</p></div>
            </div>
            {event.tickets_sold >= event.capacity && !eventPassed && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-2 mb-6 text-center font-semibold">
                Entradas agotadas
              </div>
            )}

            {/* Organizador */}
            <div
              onClick={() => user?.userId !== String(event.organizer_id) && navigate(`/organizer/${event.organizer_id}`)}
              className={`flex items-center gap-3 bg-gray-800 rounded-xl p-4 mb-6 ${user?.userId === String(event.organizer_id) ? 'cursor-default' : 'cursor-pointer hover:bg-gray-700 transition'}`}>
              <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:'bold', color:'white', overflow:'hidden', flexShrink:0}}>
                {organizer?.avatar_url ? (
                  <img src={organizer.avatar_url} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : 'O'}
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-xs">Organizador</p>
                <p className="text-white font-semibold text-sm">
                  {user?.userId === String(event.organizer_id) ? 'Tu evento' : organizer?.producer_name || 'Cargando...'}
                </p>
              </div>
              {user?.userId !== String(event.organizer_id) && (
                <span className="text-gray-500 text-sm"></span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {images.map(img => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt="evento"
                    className={`h-16 w-24 object-cover rounded-lg flex-shrink-0 ${img.is_primary ? 'ring-2 ring-purple-500' : 'opacity-70'}`}
                  />
                ))}
              </div>
            )}

            {(() => {
              const soldOut = event.tickets_sold >= event.capacity

              if (eventPassed) {
                return <p className="text-gray-500 text-sm text-center">Este evento ya ocurrió</p>
              }

              if (user && !user.isOrganizer) {
                if (soldOut) {
                  return (
                    <button disabled className="bg-gray-800 text-gray-500 px-6 py-3 rounded-lg font-semibold w-full cursor-not-allowed">
                      Agotado
                    </button>
                  )
                }
                return (
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition w-full">
                    Reservar entrada
                  </button>
                )
              }

              return null
            })()}

            {success && <p className="mt-3 text-center text-sm text-green-400">{success}</p>}
            {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
          </div>
        </div>

        {/* Reseñas */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Reseñas ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400">Todavía no hay reseñas.</p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="border-b border-gray-800 py-4">
                <div className="flex justify-between mb-1">
                  <div>
                    <span className="text-yellow-400">{'⭐'.repeat(Math.round(r.rating))}</span>
                    {r.user_name && (
                      <span
                        className="text-gray-500 text-base hover:text-purple-400 transition cursor-pointer"
                        onClick={e => { e.stopPropagation(); navigate(`/user/${r.user_id}`) }}>
                        {' - '} {r.user_name}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500 text-sm">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-300">{r.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Formulario de reseña */}
        {user && !user.isOrganizer && eventPassed && (
          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4">Dejar una reseña</h2>
            {alreadyReviewed ? (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">Ya dejaste una reseña para este evento.</p>
              </div>
            ) : (
              <form onSubmit={handleReview} className="flex flex-col gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Calificación</label>
                  <select
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 w-full outline-none"
                    value={form.rating}
                    onChange={e => setForm({...form, rating: parseFloat(e.target.value)})}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                  </select>
                </div>
                <div>
                  <textarea
                    placeholder="Contá tu experiencia..."
                    className={`bg-gray-800 text-white rounded-lg px-4 py-3 outline-none resize-none h-28 w-full ${commentError ? 'ring-2 ring-red-500' : ''}`}
                    value={form.comment}
                    onChange={e => { setForm({...form, comment: e.target.value}); setCommentError('') }}
                  />
                  {commentError && <p className="text-red-400 text-sm mt-1">{commentError}</p>}
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                {success && <p className="text-green-400 text-sm">{success}</p>}
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition">
                  Publicar reseña
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
