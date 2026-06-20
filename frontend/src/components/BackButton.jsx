import { useNavigate } from 'react-router-dom'

export default function BackButton() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(-1)}
      className="text-purple-400 hover:text-purple-300 transition text-sm font-semibold">
      Volver
    </button>
  )
}