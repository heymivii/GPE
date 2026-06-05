import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EA3C0]"></div>
      </div>
    );
  }

  // Support varying casings or names for roles: roles, role, userRole
  const userRole = (user as any)?.roles || user?.role || user?.userRole || '';
  const isAdmin = userRole.toLowerCase() === 'admin';

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
