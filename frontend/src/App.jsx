import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import EventDetail from './pages/EventDetail'
import CreateEvent from './pages/CreateEvent'
import Profile from './pages/Profile'
import MyTickets from './pages/MyTickets'
import MyReviews from './pages/MyReviews'
import MyEvents from './pages/MyEvents'
import EditEvent from './pages/EditEvent'
import OrganizerProfile from './pages/OrganizerProfile'
import FiesteroProfile from './pages/FiesteroProfile'

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
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/my-reviews" element={<MyReviews />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/events/edit/:id" element={<EditEvent />} />
          <Route path="/organizer/:id" element={<OrganizerProfile />} />
          <Route path="/fiestero-profile" element={<FiesteroProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}