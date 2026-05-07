import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import EventDetail from './pages/EventDetail'
import CreateEvent from './pages/CreateEvent'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Home />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/create" element={<CreateEvent />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}