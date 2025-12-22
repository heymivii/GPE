import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

const languages = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
];

export default function NavBar() {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLanguageChange = (langCode: string) => {
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(langCode);
    } else {
      console.error('i18n instance is not ready or invalid:', i18n);
    }
    setLangOpen(false);
  };

  const currentLang = (i18n?.language && languages.find(l => l.code === i18n.language)) || languages[0];

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
        
        <div className="hidden md:flex gap-6 items-center">
          {!isAuthenticated ? (
            <>
              <Link to="/" className="text-gray-700 hover:text-black">{t('nav.home')}</Link>
              <Link to="/destinations" className="text-gray-700 hover:text-black">{t('nav.destinations')}</Link>
              <Link to="/services" className="text-gray-700 hover:text-black">{t('nav.services')}</Link>
              <Link to="/comparison" className="text-gray-700 hover:text-black">{t('nav.comparison')}</Link>
              <Link to="/search" className="text-gray-700 hover:text-black">{t('nav.search')}</Link>
              <Link to="/forum" className="text-gray-700 hover:text-black">{t('nav.forum')}</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-black">{t('nav.dashboard')}</Link>
              <Link to="/projects" className="text-gray-700 hover:text-black">{t('nav.projects')}</Link>
              <Link to="/services" className="text-gray-700 hover:text-black">{t('nav.services')}</Link>
              
              {/* Menu Explorer pour utilisateurs connectés */}
              <div className="relative">
                <button 
                  className="flex items-center gap-1 text-gray-700 hover:text-black"
                  onClick={() => setExploreOpen(!exploreOpen)}
                  onBlur={() => setTimeout(() => setExploreOpen(false), 200)}
                >
                  {t('nav.explore')}
                  <svg className={`w-4 h-4 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                
                {exploreOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                    <Link to="/destinations" className="block px-4 py-2 hover:bg-gray-100 text-gray-700">
                      {t('nav.destinations')}
                    </Link>
                    <Link to="/comparison" className="block px-4 py-2 hover:bg-gray-100 text-gray-700">
                      {t('nav.comparison')}
                    </Link>
                    <Link to="/search" className="block px-4 py-2 hover:bg-gray-100 text-gray-700">
                      {t('nav.search')}
                    </Link>
                  </div>
                )}
              </div>
              
              <Link to="/forum" className="text-gray-700 hover:text-black">{t('nav.forum')}</Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
         <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700"
            onClick={() => setLangOpen((v) => !v)}
          >
            <span className="capitalize">{currentLang.label}</span>
            <svg className={`w-4 h-4 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
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
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                  onClick={() => setUserMenuOpen(false)}
                >
                  {t('nav.myDashboard')}
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                  onClick={() => setUserMenuOpen(false)}
                >
                  {t('nav.profile')}
                </Link>
                <hr className="my-1" />
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  onClick={handleLogout}
                >
                  {t('nav.logout')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/auth/login" className="text-gray-700 hover:text-black px-4 py-2">{t('nav.login')}</Link>
            <Link to="/auth/register" className="bg-[#5EA3C0] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#4891b0] transition-colors">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
}