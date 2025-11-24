import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const languages = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

export default function NavBar() {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow w-full">
   
      <div className="flex items-center gap-8">
        <Link 
          to={isAuthenticated ? "/dashboard" : "/"} 
          className="text-xl font-bold font-aclonica"
        >
          SkyWalk
        </Link>
        
        <div className="hidden md:flex gap-6">
          {!isAuthenticated && (
            <Link to="/" className="text-gray-700 hover:text-black">Accueil</Link>
          )}
          
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-black">Tableau de bord</Link>
              <Link to="/projects" className="text-gray-700 hover:text-black">Mes Projets</Link>
              <Link to="/comparison" className="text-gray-700 hover:text-black">Comparateur</Link>
            </>
          )}
          
          <Link to="/search" className="text-gray-700 hover:text-black">Moteur de Recherche</Link>
          <Link to="/destinations" className="text-gray-700 hover:text-black">Destinations</Link>
          <Link to="/forum" className="text-gray-700 hover:text-black">Forum</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
         <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700"
            onClick={() => setLangOpen((v) => !v)}
          >
            <span className="capitalize">{selectedLang.label}</span>
            <svg className={`w-4 h-4 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedLang.code === lang.code ? 'font-bold text-[#5EA3C0]' : ''}`}
                  onClick={() => { setSelectedLang(lang); setLangOpen(false); }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full bg-white hover:bg-gray-50"
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              <div className="w-8 h-8 rounded-full bg-[#5EA3C0] text-white flex items-center justify-center font-semibold">
                {user.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-gray-700">{user.fullName}</span>
              <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Mon tableau de bord
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Mon profil
                </Link>
                <hr className="my-1" />
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  onClick={handleLogout}
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/auth/login" className="text-gray-700 hover:text-black px-4 py-2">Connexion</Link>
            <Link to="/auth/register" className="bg-[#5EA3C0] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#4891b0] transition-colors">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
}