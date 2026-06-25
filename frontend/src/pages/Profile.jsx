import { getImageUrl } from '../api';
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SideMenu from '../components/SideMenu'
import api from '../services/api'

export default function Profile() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setProfile(res.data)
      setForm(res.data)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await api.put('/auth/me', form)
      setProfile(res.data)
      setEditing(false)
      setSuccess('Perfil actualizado correctamente')
    } catch {
      setError('Error al actualizar el perfil')
    }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfile({ ...profile, avatar_url: res.data.avatar_url })
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
      localStorage.setItem('user_data', JSON.stringify({ ...userData, avatar_url: res.data.avatar_url }))
    } catch {
      setError('Error al subir la foto')
    } finally {
      setUploadingAvatar(false)
    }
}

  if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Cargando...</div>

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
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div style={{position:'relative', width:'100px', height:'100px', marginBottom:'12px'}}>
            {profile.avatar_url ? (
              <img
                src={getImageUrl(profile.avatar_url)}
                alt="avatar"
                style={{width:'100px', height:'100px', borderRadius:'50%', objectFit:'cover', border:'3px solid #7c3aed'}}
              />
            ) : (
              <div style={{width:'100px', height:'100px', borderRadius:'50%', background:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', fontWeight:'bold', color:'white', border:'3px solid #7c3aed'}}>
                {user?.isOrganizer ? 'O' : 'F'}
              </div>
            )}
            <label style={{position:'absolute', bottom:0, right:0, width:'30px', height:'30px', borderRadius:'50%', background:'#4c1d95', border:'2px solid #1f2937', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px'}}>
              ✏️
              <input type="file" accept="image/*" onChange={handleAvatar} style={{display:'none'}} />
            </label>
          </div>
          <h2 className="text-2xl font-bold">
            {user?.isOrganizer ? profile.producer_name || 'Mi perfil' : profile.name || 'Mi perfil'}
          </h2>
          <p className="text-gray-500 text-sm">{profile.email}</p>
          {uploadingAvatar && <p className="text-gray-400 text-sm mt-2">Subiendo foto...</p>}
        </div>

        {success && <p className="text-green-400 mb-4 text-center">{success}</p>}
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

        {/* Datos */}
        {!editing ? (
          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Mis datos</h3>
              <button
                onClick={() => setEditing(true)}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition">
                Editar
              </button>
            </div>

            {!user?.isOrganizer ? (
              <div className="flex flex-col gap-4">
                <DataRow label="Nombre" value={profile.name} />
                <DataRow label="Email" value={profile.email} />
                <DataRow label="Fecha de nacimiento" value={profile.birth_date} />
                <DataRow label="DNI / Pasaporte" value={profile.dni} />
                <DataRow label="Género" value={profile.gender === 'M' ? 'Masculino' : profile.gender === 'F' ? 'Femenino' : profile.gender === 'X' ? 'No binario' : null} />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <DataRow label="Productora / Organizador" value={profile.producer_name} />
                <DataRow label="Email" value={profile.email} />
                <DataRow label="CUIT / CUIL" value={profile.cuit} />
                <DataRow label="Razón Social" value={profile.razon_social} />
                <DataRow label="Email corporativo" value={profile.corporate_email} />
                <DataRow label="Teléfono" value={profile.phone} />
                <DataRow label="CBU / CVU" value={profile.cbu} />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Editar datos</h3>
              <button
                onClick={() => { setEditing(false); setForm(profile) }}
                className="text-gray-400 hover:text-white text-sm transition">
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!user?.isOrganizer ? (
                <>
                  <input type="text" placeholder="Nombre y Apellido"
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
                  <input type="email" placeholder="Email" disabled
                    className="bg-gray-800 text-gray-500 rounded-lg px-4 py-3 outline-none cursor-not-allowed"
                    value={form.email || ''} />
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Fecha de nacimiento</label>
                    <input type="date"
                      className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none w-full"
                      value={form.birth_date || ''} onChange={e => setForm({...form, birth_date: e.target.value})} />
                  </div>
                  <input type="text" placeholder="DNI / Pasaporte"
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.dni || ''} onChange={e => setForm({...form, dni: e.target.value})} />
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
                  <input type="text" placeholder="Nombre de la Productora"
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.producer_name || ''} onChange={e => setForm({...form, producer_name: e.target.value})} />
                  <input type="text" placeholder="CUIT / CUIL"
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.cuit || ''} onChange={e => setForm({...form, cuit: e.target.value})} />
                  <input type="text" placeholder="Razón Social"
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.razon_social || ''} onChange={e => setForm({...form, razon_social: e.target.value})} />
                  <input type="email" placeholder="Email" disabled
                    className="bg-gray-800 text-gray-500 rounded-lg px-4 py-3 outline-none cursor-not-allowed"
                    value={form.email || ''} />
                  <div>
                    <input type="email" placeholder="Email corporativo"
                      className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none w-full"
                      value={form.corporate_email || ''} onChange={e => setForm({...form, corporate_email: e.target.value})} />
                    <p className="text-gray-500 text-xs mt-1">Si lo dejás vacío se usará tu email de acceso</p>
                  </div>
                  <input type="tel" placeholder="Teléfono"
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                  <input type="text" placeholder="CBU / CVU"
                    className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none"
                    value={form.cbu || ''} onChange={e => setForm({...form, cbu: e.target.value})} />
                </>
              )}

              <button type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition mt-2">
                Guardar cambios
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

function DataRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-800">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white text-sm">{value || <span className="text-gray-600">Sin completar</span>}</span>
    </div>
  )
}