import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SideMenu from '../components/SideMenu'
import api from '../services/api'
import BackButton from '../components/BackButton'

const LOCATIONS = {
  'Buenos Aires (CABA)': {
    type: 'barrios',
    items: ['Almagro','Balvanera','Barracas','Belgrano','Boedo','Caballito','Chacarita','Coghlan','Colegiales','Constitución','Flores','Floresta','La Boca','La Paternal','Liniers','Mataderos','Monte Castro','Montserrat','Nueva Pompeya','Núñez','Palermo','Parque Avellaneda','Parque Chacabuco','Parque Chas','Parque Patricios','Puerto Madero','Recoleta','Retiro','Saavedra','San Cristóbal','San Nicolás','San Telmo','Vélez Sársfield','Versalles','Villa Crespo','Villa del Parque','Villa Devoto','Villa General Mitre','Villa Lugano','Villa Luro','Villa Ortúzar','Villa Pueyrredón','Villa Real','Villa Riachuelo','Villa Santa Rita','Villa Soldati','Villa Urquiza']
  },
  'Buenos Aires (Provincia)': {
    type: 'ciudades',
    items: ['La Plata','Mar del Plata','Bahía Blanca','Quilmes','Lanús','General San Martín','Lomas de Zamora','Almirante Brown','Berazategui','Florencio Varela','Morón','Tigre','San Isidro','Vicente López','Tres de Febrero','Hurlingham','Ituzaingó','Malvinas Argentinas','José C. Paz','San Miguel','Moreno','Merlo','La Matanza','Ezeiza','Esteban Echeverría','Avellaneda','Zárate','Campana','Pilar','Escobar','Tandil','Necochea','Olavarría','Junín']
  },
  'Catamarca': { type: 'ciudades', items: ['San Fernando del Valle de Catamarca','Andalgalá','Belén','Santa María','Tinogasta'] },
  'Chaco': { type: 'ciudades', items: ['Resistencia','Presidencia Roque Sáenz Peña','Villa Ángela','Charata','General San Martín'] },
  'Chubut': { type: 'ciudades', items: ['Rawson','Comodoro Rivadavia','Trelew','Puerto Madryn','Esquel'] },
  'Córdoba': { type: 'ciudades', items: ['Córdoba Capital','Villa Carlos Paz','Río Cuarto','San Francisco','Villa María','Alta Gracia','Jesús María','Bell Ville','Marcos Juárez','Río Tercero'] },
  'Corrientes': { type: 'ciudades', items: ['Corrientes Capital','Goya','Mercedes','Curuzú Cuatiá','Paso de los Libres'] },
  'Entre Ríos': { type: 'ciudades', items: ['Paraná','Concordia','Gualeguaychú','Concepción del Uruguay','Colón'] },
  'Formosa': { type: 'ciudades', items: ['Formosa Capital','Clorinda','Pirané','El Colorado'] },
  'Jujuy': { type: 'ciudades', items: ['San Salvador de Jujuy','Palpalá','San Pedro','Libertador General San Martín','Humahuaca'] },
  'La Pampa': { type: 'ciudades', items: ['Santa Rosa','General Pico','Toay','Realicó','General Acha'] },
  'La Rioja': { type: 'ciudades', items: ['La Rioja Capital','Chilecito','Aimogasta','Chamical'] },
  'Mendoza': { type: 'ciudades', items: ['Mendoza Capital','San Rafael','Godoy Cruz','Luján de Cuyo','Maipú','Las Heras','Guaymallén','Rivadavia','San Martín'] },
  'Misiones': { type: 'ciudades', items: ['Posadas','Oberá','Eldorado','Puerto Iguazú','Apóstoles'] },
  'Neuquén': { type: 'ciudades', items: ['Neuquén Capital','San Martín de los Andes','Zapala','Cutral Có','Plottier'] },
  'Río Negro': { type: 'ciudades', items: ['Viedma','Bariloche','General Roca','Cipolletti','El Bolsón'] },
  'Salta': { type: 'ciudades', items: ['Salta Capital','Orán','Tartagal','San Ramón de la Nueva Orán','Metán'] },
  'San Juan': { type: 'ciudades', items: ['San Juan Capital','Rivadavia','Chimbas','Santa Lucía','Pocito'] },
  'San Luis': { type: 'ciudades', items: ['San Luis Capital','Villa Mercedes','Merlo','Justo Daract','Quines'] },
  'Santa Cruz': { type: 'ciudades', items: ['Río Gallegos','Caleta Olivia','Pico Truncado','El Calafate'] },
  'Santa Fe': { type: 'ciudades', items: ['Santa Fe Capital','Rosario','Rafaela','Venado Tuerto','Santo Tomé','Reconquista','Villa Constitución','Casilda'] },
  'Santiago del Estero': { type: 'ciudades', items: ['Santiago del Estero Capital','La Banda','Termas de Río Hondo','Añatuya','Frías'] },
  'Tierra del Fuego': { type: 'ciudades', items: ['Ushuaia','Río Grande','Tolhuin'] },
  'Tucumán': { type: 'ciudades', items: ['San Miguel de Tucumán','Tafí Viejo','Banda del Río Salí','Yerba Buena','Concepción'] }
}

export default function CreateEvent() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    date: '', price: '', capacity: '', is_recurring: false
  })
  const [provincia, setProvincia] = useState('')
  const [localidad, setLocalidad] = useState('')
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
        <div className="flex gap-4 items-center">
          <BackButton />
          <button onClick={() => navigate('/my-events')} className="text-purple-400 hover:text-purple-300 transition text-sm font-semibold">
            Mis eventos
          </button>
        </div>
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

          {/* Ubicación */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Provincia</label>
              <select
                className="bg-gray-900 text-white rounded-lg px-4 py-3 outline-none w-full"
                value={provincia}
                onChange={e => { setProvincia(e.target.value); setLocalidad(''); setForm({...form, location: ''}) }}
                required>
                <option value="">Seleccioná una provincia</option>
                {Object.keys(LOCATIONS).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {provincia && (
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  {LOCATIONS[provincia].type === 'barrios' ? 'Barrio' : 'Ciudad'}
                </label>
                <select
                  className="bg-gray-900 text-white rounded-lg px-4 py-3 outline-none w-full"
                  value={localidad}
                  onChange={e => { setLocalidad(e.target.value); setForm({...form, location: `${e.target.value}, ${provincia}`}) }}
                  required>
                  <option value="">Seleccioná {LOCATIONS[provincia].type === 'barrios' ? 'un barrio' : 'una ciudad'}</option>
                  {LOCATIONS[provincia].items.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Fecha</label>
              <input type="date" required
                className="bg-gray-900 text-white rounded-lg px-4 py-3 outline-none w-full"
                value={form.date ? form.date.split('T')[0] : ''}
                onChange={e => {
                  const time = form.date ? form.date.split('T')[1] : '20:00'
                  setForm({...form, date: `${e.target.value}T${time}`})
                }} />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Hora</label>
              <input type="time" required
                className="bg-gray-900 text-white rounded-lg px-4 py-3 outline-none w-full"
                value={form.date ? form.date.split('T')[1] : ''}
                onChange={e => {
                  const date = form.date ? form.date.split('T')[0] : new Date().toISOString().split('T')[0]
                  setForm({...form, date: `${date}T${e.target.value}`})
                }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
            type="number"
            placeholder="Precio"
            required
            className="bg-gray-900 text-white rounded-lg px-4 py-3 outline-none"
            value={form.price}
            onChange={e => setForm({...form, price: e.target.value})}
            onWheel={e => e.target.blur()}
          />
          <input
            type="number"
            placeholder="Capacidad"
            required
            className="bg-gray-900 text-white rounded-lg px-4 py-3 outline-none"
            value={form.capacity}
            onChange={e => setForm({...form, capacity: e.target.value})}
            onWheel={e => e.target.blur()}
          />
          </div>

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