import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SideMenu from '../components/SideMenu'
import api from '../services/api'

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

function EventCard({ event }) {
  const [primaryImage, setPrimaryImage] = useState(null)

  useEffect(() => {
    api.get(`/events/${event.id}/images`).then(res => {
      const primary = res.data.find(img => img.is_primary) || res.data[0]
      setPrimaryImage(primary)
    }).catch(() => {})
  }, [event.id])

  return (
    <Link to={`/events/${event.id}`}>
      <div className="bg-gray-900 rounded-2xl overflow-hidden hover:ring-2 hover:ring-purple-500 transition">
        <div className="bg-gray-800 h-40 flex items-center justify-center overflow-hidden">
          {primaryImage ? (
            <img
              src={`http://127.0.0.1:8000${primaryImage.url}`}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl text-gray-600">📷</span>
          )}
        </div>
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
  )
}

export default function Home() {
  const [events, setEvents] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { user } = useAuth()

  const [search, setSearch] = useState('')
  const [provincia, setProvincia] = useState('')
  const [localidad, setLocalidad] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    api.get('/events/').then(res => setEvents(res.data))
  }, [])

  const activeFiltersCount = [provincia, localidad, dateFrom, dateTo].filter(Boolean).length
    + (minPrice && parseFloat(minPrice) > 0 ? 1 : 0)
    + (maxPrice && parseFloat(maxPrice) > 0 ? 1 : 0)
    
  const clearFilters = () => {
  setProvincia('')
  setLocalidad('')
  setMinPrice('')
  setMaxPrice('')
  setDateFrom('')
  setDateTo('')
  setSortBy('recent')
  }

  let filteredEvents = events.filter(event => {
    if (search && !event.title.toLowerCase().includes(search.toLowerCase())) return false
    if (provincia && !event.location.includes(provincia)) return false
    if (localidad && !event.location.includes(localidad)) return false
    if (minPrice && parseFloat(minPrice) > 0 && event.price < parseFloat(minPrice)) return false
    if (maxPrice && parseFloat(maxPrice) > 0 && event.price > parseFloat(maxPrice)) return false
    if (dateFrom && new Date(event.date) < new Date(dateFrom)) return false
    if (dateTo && new Date(event.date) > new Date(dateTo + 'T23:59:59')) return false
    return true
  })

  if (sortBy === 'price_asc') filteredEvents = [...filteredEvents].sort((a, b) => a.price - b.price)
  else if (sortBy === 'price_desc') filteredEvents = [...filteredEvents].sort((a, b) => b.price - a.price)
  else if (sortBy === 'rating') filteredEvents = [...filteredEvents].sort((a, b) => b.average_rating - a.average_rating)
  else if (sortBy === 'date') filteredEvents = [...filteredEvents].sort((a, b) => new Date(a.date) - new Date(b.date))
  else filteredEvents = [...filteredEvents].sort((a, b) => b.id - a.id)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <nav className="bg-gray-900 px-6 py-4 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          {user && (
            <button
              onClick={() => setMenuOpen(true)}
              style={{width:'38px', height:'38px', borderRadius:'8px', background:'transparent', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:'5px', padding:'4px'}}>
              <span style={{display:'block', width:'22px', height:'2px', background:'#a78bfa', borderRadius:'2px'}}></span>
              <span style={{display:'block', width:'22px', height:'2px', background:'#a78bfa', borderRadius:'2px'}}></span>
              <span style={{display:'block', width:'22px', height:'2px', background:'#a78bfa', borderRadius:'2px'}}></span>
            </button>
          )}
          <h1 className="text-xl font-bold text-purple-400">Wharty</h1>
        </div>
        <div className="flex gap-4 items-center">
          {user?.isOrganizer && (
            <Link to="/events/create" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition text-sm font-semibold">
              + Crear evento
            </Link>
          )}
          {!user && (
            <>
              <Link to="/login" className="text-gray-400 hover:text-white transition">Iniciar sesión</Link>
              <Link to="/register" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition">Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-6">Eventos disponibles</h2>

        <div className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar eventos por nombre..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-gray-900 text-white rounded-lg px-4 py-3 pl-10 outline-none w-full border border-gray-800 focus:border-purple-500 transition"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`px-4 py-3 rounded-lg border transition font-semibold text-sm flex items-center gap-2 ${filtersOpen || activeFiltersCount > 0 ? 'bg-purple-600 border-purple-600 text-white' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600'}`}>
              Filtros
              {activeFiltersCount > 0 && (
                <span className="bg-white text-purple-700 rounded-full text-xs font-bold w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {filtersOpen && (
            <div className="bg-gray-900 rounded-2xl p-5 mt-3 border border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Provincia</label>
                  <select
                    value={provincia}
                    onChange={e => { setProvincia(e.target.value); setLocalidad('') }}
                    className="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none w-full text-sm">
                    <option value="">Todas</option>
                    {Object.keys(LOCATIONS).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">
                    {provincia ? (LOCATIONS[provincia].type === 'barrios' ? 'Barrio' : 'Ciudad') : 'Barrio/Ciudad'}
                  </label>
                  <select
                    value={localidad}
                    onChange={e => setLocalidad(e.target.value)}
                    disabled={!provincia}
                    className="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none w-full text-sm disabled:opacity-50">
                    <option value="">Todos</option>
                    {provincia && LOCATIONS[provincia].items.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Precio mínimo</label>
                  <input
                    type="number"
                    placeholder="Sin límite"
                    step="10000"
                    min="0"
                    value={minPrice}
                    onChange={e => {
                      const val = e.target.value
                      setMinPrice(val === '0' ? '' : val)
                    }}
                    className="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none w-full text-sm"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Precio máximo</label>
                  <input
                    type="number"
                    placeholder="Sin límite"
                    step="10000"
                    min="0"
                    value={maxPrice}
                    onChange={e => {
                      const val = e.target.value
                      setMaxPrice(val === '0' ? '' : val)
                    }}
                    className="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none w-full text-sm"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none w-full text-sm">
                    <option value="recent">Más recientes</option>
                    <option value="date">Próximos primero</option>
                    <option value="price_asc">Precio: menor a mayor</option>
                    <option value="price_desc">Precio: mayor a menor</option>
                    <option value="rating">Mejor calificados</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Desde</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none w-full text-sm"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Hasta</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none w-full text-sm"
                  />
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="flex justify-end mt-4">
                  <button onClick={clearFilters} className="text-gray-400 hover:text-white text-sm transition">
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <p className="text-gray-400">
            {events.length === 0 ? 'No hay eventos disponibles por ahora.' : 'No se encontraron eventos con esos filtros.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}