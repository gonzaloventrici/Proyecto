import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import BackButton from '../components/BackButton'

function isOver18(birthDate) {
  const today = new Date()
  const birth = new Date(birthDate)
  const age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  return age > 18 || (age === 18 && m >= 0 && today.getDate() >= birth.getDate())
}

export default function Register() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState(null)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    birth_date: '', dni: '', gender: '',
    producer_name: '', cuit: '', razon_social: '',
    corporate_email: '', phone: '', cbu: ''
  })
  const [error, setError] = useState('')
  const [dniError, setDniError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [cbuError, setCbuError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (role === 'user' && !isOver18(form.birth_date)) {
      setError('Debés ser mayor de 18 años para registrarte')
      return
    }

    const payload = {
      email: form.email,
      password: form.password,
      is_organizer: role === 'organizer',
    }

    if (role === 'user') {
      payload.name = form.name
      payload.birth_date = form.birth_date
      payload.dni = form.dni
      payload.gender = form.gender
    } else {
      payload.producer_name = form.producer_name
      payload.cuit = form.cuit
      payload.razon_social = form.razon_social
      payload.corporate_email = form.corporate_email || form.email
      payload.phone = form.phone
      payload.cbu = form.cbu
    }

    try {
      await api.post('/auth/register', payload)
      navigate('/login')
    } catch (err) {
    if (err.response?.status === 400) {
      setError('Ese email ya está registrado. Probá con otro o iniciá sesión.')
    } else {
      setError('Error al registrarse, intentá de nuevo.')
    }
}
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center py-10">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md">

        {step === 1 ? (
          <>
          <div className="mb-4">
            <BackButton />
          </div>
            <h1 className="text-2xl font-bold text-white mb-2">Crear cuenta</h1>
            <p className="text-gray-400 mb-8">¿Cómo querés usar Wharty?</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => { setRole('user'); setStep(2) }}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-xl p-6 text-left transition">
                <div className="text-3xl mb-3">🎉</div>
                <div className="text-white font-semibold text-lg mb-1">Soy fiestero</div>
                <div className="text-gray-400 text-sm">Quiero descubrir eventos, comprar entradas y dejar reseñas</div>
              </button>
              <button
                onClick={() => { setRole('organizer'); setStep(2) }}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-xl p-6 text-left transition">
                <div className="text-3xl mb-3">🎛️</div>
                <div className="text-white font-semibold text-lg mb-1">Soy organizador</div>
                <div className="text-gray-400 text-sm">Quiero publicar eventos y gestionar mis ventas</div>
              </button>
            </div>
            <p className="text-gray-400 mt-6 text-center">
              ¿Ya tenés cuenta? <Link to="/login" className="text-purple-400 hover:underline">Iniciá sesión</Link>
            </p>
          </>
        ) : (
          <>
            <div className="flex gap-4 mb-6">
              <BackButton />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {role === 'organizer' ? '🎛️ Cuenta de organizador' : '🎉 Cuenta de fiestero'}
            </h1>
            <p className="text-gray-400 mb-6 text-sm">Completá tus datos para continuar</p>
            {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {role === 'user' ? (
                <>
                  <input type="text" placeholder="Nombre y Apellido" required
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  <input type="email" placeholder="Email" required
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  <input type="password" placeholder="Contraseña" required
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Fecha de nacimiento</label>
                    <input type="date" required
                      className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none w-full"
                      value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} />
                  </div>
                  <div>
                    <input type="text" placeholder="DNI / Pasaporte" required
                      className={`bg-gray-800 text-white rounded-lg px-4 py-3 outline-none w-full ${dniError ? 'ring-2 ring-red-500' : ''}`}
                      value={form.dni}
                      onChange={e => {
                        const val = e.target.value
                        if (/^\d*$/.test(val)) {
                          setForm({...form, dni: val})
                          setDniError('')
                        } else {
                          setDniError('El DNI solo puede contener números')
                        }
                      }} />
                    {dniError && <p className="text-red-400 text-xs mt-1">{dniError}</p>}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Género</label>
                    <div className="flex gap-3">
                      {['M', 'F', 'X'].map(g => (
                        <button key={g} type="button"
                          onClick={() => setForm({...form, gender: g})}
                          className={`flex-1 py-3 rounded-lg border transition font-semibold ${form.gender === g ? 'bg-purple-600 border-purple-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'}`}>
                          {g === 'M' ? 'Masculino' : g === 'F' ? 'Femenino' : 'No binario'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Nombre de la Productora / Organizador" required
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.producer_name} onChange={e => setForm({...form, producer_name: e.target.value})} />
                  <input type="text" placeholder="CUIT / CUIL" required
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.cuit} onChange={e => setForm({...form, cuit: e.target.value})} />
                  <input type="text" placeholder="Razón Social"
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.razon_social} onChange={e => setForm({...form, razon_social: e.target.value})} />
                  <input type="email" placeholder="Email de acceso" required
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  <input type="password" placeholder="Contraseña" required
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                  <div>
                    <input type="email" placeholder="Email corporativo (opcional)"
                      className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none w-full"
                      value={form.corporate_email} onChange={e => setForm({...form, corporate_email: e.target.value})} />
                    <p className="text-gray-500 text-xs mt-1">Si lo dejás vacío se usará tu email de acceso</p>
                  </div>
                  <div>
                    <input type="tel" placeholder="Teléfono" required
                      className={`bg-gray-800 text-white rounded-lg px-4 py-3 outline-none w-full ${phoneError ? 'ring-2 ring-red-500' : ''}`}
                      value={form.phone}
                      onChange={e => {
                        const val = e.target.value
                        if (/^\d*$/.test(val)) {
                          setForm({...form, phone: val})
                          setPhoneError('')
                        } else {
                          setPhoneError('El teléfono solo puede contener números')
                        }
                      }} />
                    {phoneError && <p className="text-red-400 text-xs mt-1">{phoneError}</p>}
                  </div>
                  <div>
                    <input type="text" placeholder="CBU / CVU" required
                      className={`bg-gray-800 text-white rounded-lg px-4 py-3 outline-none w-full ${cbuError ? 'ring-2 ring-red-500' : ''}`}
                      value={form.cbu}
                      onChange={e => {
                        const val = e.target.value
                        if (/^\d*$/.test(val)) {
                          setForm({...form, cbu: val})
                          setCbuError('')
                        } else {
                          setCbuError('El CBU solo puede contener números')
                        }
                      }} />
                    {cbuError && <p className="text-red-400 text-xs mt-1">{cbuError}</p>}
                  </div>
                </>
              )}

              <button type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition mt-2">
                Crear cuenta
              </button>
            </form>

            <p className="text-gray-400 mt-4 text-center">
              ¿Ya tenés cuenta? <Link to="/login" className="text-purple-400 hover:underline">Iniciá sesión</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}