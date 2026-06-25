import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.png'; // Una imagen por defecto si viene vacío
  
  // Si la ruta ya es una URL completa (http://...), la dejamos como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Si viene del backend (ej: 'uploads/evento.jpg' o '/media/evento.jpg')
  const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  
  // Aseguramos que no se dupliquen las barras '/'
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${cleanPath}`;
};