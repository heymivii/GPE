import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANT : Permet l'envoi des cookies HTTP-Only
});

// Intercepteur pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si erreur 401 et pas déjà sur la page de login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Ne redirige que si on n'est pas déjà sur une page d'auth
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
