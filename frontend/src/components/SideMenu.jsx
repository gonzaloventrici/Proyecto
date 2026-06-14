import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SideMenu({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = () => {
    setShowConfirm(false)
    onClose()
    logout()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:40}}
      />

      {/* Confirm modal */}
      {showConfirm && (
        <div style={{position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:60}}>
          <div style={{background:'#111827', borderRadius:'16px', padding:'32px', maxWidth:'340px', width:'100%', margin:'0 16px'}}>
            <h2 style={{color:'white', fontSize:'18px', fontWeight:'bold', marginBottom:'8px'}}>Cerrar sesión</h2>
            <p style={{color:'#9ca3af', marginBottom:'24px'}}>¿Seguro que querés cerrar sesión?</p>
            <div style={{display:'flex', gap:'12px'}}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{flex:1, padding:'12px', borderRadius:'8px', border:'1px solid #374151', color:'#d1d5db', background:'transparent', cursor:'pointer'}}>
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                style={{flex:1, padding:'12px', borderRadius:'8px', background:'#dc2626', color:'white', fontWeight:'600', cursor:'pointer', border:'none'}}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel - izquierda */}
      <div style={{
        position:'fixed', top:0, left:0, height:'100%', width:'280px',
        background:'#111827', zIndex:50, display:'flex', flexDirection:'column',
        padding:'24px 0'
      }}>
        {/* Header */}
        <div style={{padding:'0 24px 24px', borderBottom:'1px solid #1f2937'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
            <span style={{color:'#a78bfa', fontWeight:'bold', fontSize:'18px'}}>Wharty</span>
            <button onClick={onClose} style={{color:'#6b7280', background:'none', border:'none', cursor:'pointer', fontSize:'20px'}}>✕</button>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <div style={{
            width:'44px', height:'44px', borderRadius:'50%',
            background:'#7c3aed', display:'flex', alignItems:'center',
            justifyContent:'center', color:'white', fontWeight:'bold', fontSize:'18px',
            overflow:'hidden', flexShrink:0
          }}>
            {user?.avatar_url ? (
              <img src={`http://127.0.0.1:8000${user.avatar_url}`} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />
            ) : (
              user?.isOrganizer ? 'O' : 'F'
            )}
          </div>
            <div>
              <div style={{color:'white', fontWeight:'600', fontSize:'14px'}}>
                {user?.isOrganizer ? 'Organizador' : 'Fiestero'}
              </div>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div style={{flex:1, padding:'16px 0', display:'flex', flexDirection:'column', gap:'4px'}}>
          <MenuItem icon="" label="Mi perfil" to={user?.isOrganizer ? `/organizer/${user?.userId}` : '/fiestero-profile'} onClose={onClose} />
          {user?.isOrganizer ? (
            <MenuItem icon="" label="Mis eventos" to="/my-events" onClose={onClose} />
          ) : (
            <>
              <MenuItem icon="" label="Mis entradas" to="/my-tickets" onClose={onClose} />
              <MenuItem icon="" label="Mis reseñas" to="/my-reviews" onClose={onClose} />
            </>
          )}
        </div>

        {/* Logout */}
        <div style={{padding:'16px 24px', borderTop:'1px solid #1f2937'}}>
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              width:'100%', padding:'12px', borderRadius:'8px',
              background:'#1f2937', border:'1px solid #374151',
              color:'#ef4444', cursor:'pointer', fontWeight:'600',
              display:'flex', alignItems:'center', gap:'10px'
            }}>
             Cerrar sesión
          </button>
        </div>
      </div>
    </>
  )
}

function MenuItem({ icon, label, to, onClose }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => { onClose(); navigate(to) }}
      style={{
        display:'flex', alignItems:'center', gap:'12px',
        padding:'12px 24px', background:'none', border:'none',
        color:'#d1d5db', cursor:'pointer', textAlign:'left',
        fontSize:'15px', width:'100%'
      }}
      onMouseEnter={e => e.currentTarget.style.background='#1f2937'}
      onMouseLeave={e => e.currentTarget.style.background='none'}
    >
      <span style={{fontSize:'18px'}}>{icon}</span>
      {label}
    </button>
  )
}