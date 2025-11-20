// Composant pour protéger les routes publiques (landing, login, register)
// Redirige automatiquement vers /dashboard si l'utilisateur est déjà connecté

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Pendant le chargement, afficher un loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  // Si déjà connecté, rediriger vers le dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Sinon, afficher la route publique demandée
  return <Outlet />;
}
