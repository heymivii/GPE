import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ClipboardList, LogOut, ShieldAlert, Menu, X, Globe, MapPin, Compass, Users, Link2, BookMarked, BadgeCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import NotificationBell from './NotificationBell';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      path: '/admin/dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      path: '/admin/roles',
      label: 'Gestion des Rôles',
      icon: Users,
    },
    {
      path: '/admin/projects',
      label: 'Gestion Projets',
      icon: FolderKanban,
    },
    {
      path: '/admin/procedures',
      label: 'Gestion Démarches',
      icon: ClipboardList,
    },
    {
      path: '/admin/continents',
      label: 'Gestion Continents',
      icon: Globe,
    },
    {
      path: '/admin/countries',
      label: 'Gestion Pays',
      icon: MapPin,
    },
    {
      path: '/admin/cities',
      label: 'Gestion Villes',
      icon: Compass,
    },
    {
      path: '/admin/gov-links',
      label: 'Liens Gouvernementaux',
      icon: Link2,
    },
    {
      path: '/admin/search-hints',
      label: 'Carnet de recherche',
      icon: BookMarked,
    },
    {
      path: '/admin/moderation',
      label: 'Modération Forum',
      icon: ShieldAlert,
    },
    {
      path: '/admin/experts',
      label: 'Experts vérifiés',
      icon: BadgeCheck,
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row font-outfit overflow-hidden">
      <Toaster position="top-right" />
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-4 bg-slate-900 text-white shadow-md z-30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#5EA3C0]" />
          <span className="font-semibold text-lg tracking-wider">Console Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-200 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 h-screen md:h-full bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } shadow-xl`}
      >
        <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
          {/* Logo Section */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800 flex-shrink-0">
            <div className="bg-[#5EA3C0]/15 p-2 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-[#5EA3C0]" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-wide text-lg">SkyWalk</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Console d'Admin</p>
            </div>
          </div>

          {/* User Profile Summary + review notifications */}
          <div className="px-6 py-4 flex items-center gap-3 bg-slate-950/40 border-b border-slate-800 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5EA3C0] to-[#4891b0] text-white flex items-center justify-center font-bold text-sm">
              {user?.fullName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
            <NotificationBell />
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-[#5EA3C0] text-white shadow-md shadow-[#5EA3C0]/20'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0 space-y-1">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 flex-shrink-0" />
            Retour à la plateforme
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
