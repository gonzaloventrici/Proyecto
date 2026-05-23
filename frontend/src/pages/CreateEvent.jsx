import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SideMenu from '../components/SideMenu'
import api from '../services/api'

export default function CreateEvent() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    date: '', price: '', capacity: '', is_recurring: false
  })
  const [imageFiles, setImageFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/events/', {
        ...form,
        price: parseFloat(form.price),
        capacity: parseInt(form.capacity),
        date: new Date(form.date).toISOString()
      })

      const eventId = res.data.id

      for (const file of imageFiles) {
        const formData = new FormData()
        formData.append('file', file)
        await api.post(`/events/${eventId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      setDone(true)
      setTimeout(() => navigate('/my-events'), 2000)
    } catch {
      setError('Error al crear el evento. Verificá que todos los campos estén completos.')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">Evento creado correctamente</h2>
        <p className="text-gray-400">Redirigiendo a tus eventos...</p>
      </div>
    </div>
  )

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
        <button onClick={() => navigate('/my-events')} className="text-gray-400 hover:text-white transition text-sm">
          ← Mis eventos
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8">Crear nuevo evento</h2>
        {error && <p className="text-red-400 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input type="text" placeholder="Nombre del evento" required
            className="bg-gray-900 text-white rounded-lg px-4 py-3 outline-none"
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <textarea placeholder="Descripción"
            className="bg-gray-900 text-white rounded-lg px-4 py-3 outline-none resize-none h-28"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <input type="text" placeholder="Ubicación" required
            className="bg-gray-900 text-white rounded-lg px-4 py-3 outline-none"
            value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Fecha y hora</label>
            <input type="datetime-local" required
              className="bg-gray-900 text-white rounded-lg px-4 py-3 outline-none w-full"
              value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Precio" required
              className="bg-gray-900 text-white rounded-lg px-4 py-3 outline-none"
              value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
            <input type="number" placeholder="Capacidad" required
              className="bg-gray-900 text-white rounded-lg px-4 py-3 outline-none"
              value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} />
          </div>

          <label className="flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-3 cursor-pointer">
            <input type="checkbox" checked={form.is_recurring}
              onChange={e => setForm({...form, is_recurring: e.target.checked})}
              className="w-4 h-4 accent-purple-600" />
            <div>
              <div className="text-white text-sm font-semibold">Evento recurrente</div>
              <div className="text-gray-500 text-xs">Este evento se repite ocasionalmente</div>
            </div>
          </label>

          {/* Imágenes */}
          <div className="bg-gray-900 rounded-2xl p-6">
            <p className="text-white font-semibold mb-1">Imágenes del evento</p>
            <p className="text-gray-500 text-xs mb-4">La primera imagen será la principal. Podés seleccionar varias a la vez.</p>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden">
                    <img src={src} alt="preview" className="w-full h-24 object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">Principal</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <input type="file" accept="image/*" multiple onChange={handleImages}
              className="text-gray-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer" />
          </div>

          <button type="submit" disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 mt-2">
            {loading ? 'Creando...' : 'Crear evento'}
          </button>
        </form>
      </div>
    </div>
  )
}