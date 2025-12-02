import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * PublicRoute : Bloque l'accès aux pages auth (login, register) si déjà connecté
 * Redirige vers /dashboard si l'utilisateur est déjà authentifié
 */
export default function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si connecté, redirige vers le dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Sinon, affiche la page demandée (login, register, etc.)
  return <Outlet />;
}
