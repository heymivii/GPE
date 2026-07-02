import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Menu, X, ChevronDown, Globe, LogOut, User, LayoutDashboard, FolderKanban, Compass, BarChart3, MapPin, Briefcase, BookOpen, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import GlobalSearchModal from './GlobalSearchModal';
import CurrencySelector from './CurrencySelector';
import ProjectSwitcher from './ProjectSwitcher';

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function NavBar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const exploreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const userRole = (user as any)?.roles || user?.role || user?.userRole || '';
  const isAdmin = userRole.toLowerCase() === 'admin';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) setExploreOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLanguageChange = (langCode: string) => {
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(langCode);
    }
    setLangOpen(false);
  };

  const currentLang = (i18n?.language && languages.find(l => l.code === i18n.language)) || languages[0];

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      isActive(path)
        ? 'text-[#5EA3C0]'
        : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <>
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <div className="flex items-center gap-8">
            <Link 
              to={isAuthenticated ? '/dashboard' : '/'} 
              className="flex-shrink-0"
            >
              <img src="/LogoSW.svg" alt="SkyWalk" className="h-7" />
            </Link>
            
            <div className="hidden lg:flex items-center gap-6">
              {!isAuthenticated ? (
                <>
                  <Link to="/" className={linkClass('/')}>{t('nav.home')}</Link>
                  <Link to="/destinations" className={linkClass('/destinations')}>{t('nav.destinations')}</Link>
                  <Link to="/comparison" className={linkClass('/comparison')}>{t('nav.comparison')}</Link>
                  <Link to="/services" className={linkClass('/services')}>{t('nav.services')}</Link>
                  <Link to="/blog" className={linkClass('/blog')}>{t('nav.blog')}</Link>
                  <Link to="/forum" className={linkClass('/forum')}>{t('nav.forum')}</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className={linkClass('/dashboard')}>{t('nav.dashboard')}</Link>
                  <Link to="/projects" className={linkClass('/projects')}>{t('nav.projects')}</Link>

                  <div className="relative" ref={exploreRef}>
                    <button 
                      className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                        isActive('/destinations') || isActive('/comparison') || isActive('/search')
                          ? 'text-[#5EA3C0]'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => setExploreOpen(!exploreOpen)}
                    >
                      {t('nav.explore')}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {exploreOpen && (
                      <div className="absolute left-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 animate-in fade-in slide-in-from-top-1">
                        <Link to="/destinations" onClick={() => setExploreOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm">
                          <MapPin className="w-4 h-4 text-[#5EA3C0]" />
                          {t('nav.destinations')}
                        </Link>
                        <Link to="/comparison" onClick={() => setExploreOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm">
                          <BarChart3 className="w-4 h-4 text-[#5EA3C0]" />
                          {t('nav.comparison')}
                        </Link>
                        <Link to="/services" onClick={() => setExploreOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm">
                          <Briefcase className="w-4 h-4 text-[#5EA3C0]" />
                          {t('nav.services')}
                        </Link>
                        <Link to="/search" onClick={() => setExploreOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm">
                          <Compass className="w-4 h-4 text-[#5EA3C0]" />
                          {t('nav.search')}
                        </Link>
                        <Link to="/blog" onClick={() => setExploreOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm">
                          <BookOpen className="w-4 h-4 text-[#5EA3C0]" />
                          {t('nav.blog')}
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  <Link to="/forum" className={linkClass('/forum')}>{t('nav.forum')}</Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500 text-sm transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">{t('globalSearch.trigger')}</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                ⌘K
              </kbd>
            </button>

            {isAuthenticated && (
              <div className="hidden md:block">
                <ProjectSwitcher />
              </div>
            )}

            <CurrencySelector />

            <div className="relative hidden sm:block" ref={langRef}>
              <button
                className="flex items-center gap-1.5 px-2.5 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 text-sm"
                onClick={() => setLangOpen((v) => !v)}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden md:inline">{currentLang.label}</span>
                <span className="md:hidden">{currentLang.flag}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${
                        currentLang.code === lang.code ? 'text-[#5EA3C0] font-medium' : 'text-gray-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {isAuthenticated && user ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => setUserMenuOpen((v) => !v)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5EA3C0] to-[#4891b0] text-white flex items-center justify-center font-semibold text-sm">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-gray-700 font-medium hidden md:inline max-w-[120px] truncate">{user.fullName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      {t('nav.myDashboard')}
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      {t('nav.profile')}
                    </Link>
                    <Link
                      to="/projects"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FolderKanban className="w-4 h-4 text-gray-400" />
                      {t('nav.projects')}
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-blue-600 font-semibold text-sm border-t border-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ShieldAlert className="w-4 h-4 text-blue-600" />
                        Administration
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2">{t('nav.login')}</Link>
                <Link to="/auth/register" className="text-sm bg-[#5EA3C0] text-white px-5 py-2 rounded-full font-semibold hover:bg-[#4891b0] transition-colors">{t('nav.register')}</Link>
              </div>
            )}

            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-1">
            {!isAuthenticated ? (
              <>
                <MobileLink to="/" label={t('nav.home')} active={isActive('/')} />
                <MobileLink to="/destinations" label={t('nav.destinations')} active={isActive('/destinations')} />
                <MobileLink to="/comparison" label={t('nav.comparison')} active={isActive('/comparison')} />
                <MobileLink to="/services" label={t('nav.services')} active={isActive('/services')} />
                <MobileLink to="/blog" label={t('nav.blog')} active={isActive('/blog')} />
                <MobileLink to="/forum" label={t('nav.forum')} active={isActive('/forum')} />
              </>
            ) : (
              <>
                <MobileLink to="/dashboard" label={t('nav.dashboard')} active={isActive('/dashboard')} />
                <MobileLink to="/projects" label={t('nav.projects')} active={isActive('/projects')} />
                <MobileLink to="/destinations" label={t('nav.destinations')} active={isActive('/destinations')} />
                <MobileLink to="/comparison" label={t('nav.comparison')} active={isActive('/comparison')} />
                <MobileLink to="/services" label={t('nav.services')} active={isActive('/services')} />
                <MobileLink to="/search" label={t('nav.search')} active={isActive('/search')} />
                <MobileLink to="/blog" label={t('nav.blog')} active={isActive('/blog')} />
                <MobileLink to="/forum" label={t('nav.forum')} active={isActive('/forum')} />
              </>
            )}

            <div className="pt-3 border-t border-gray-100 flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { handleLanguageChange(lang.code); setMobileOpen(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentLang.code === lang.code
                      ? 'bg-[#5EA3C0]/10 text-[#5EA3C0] border border-[#5EA3C0]/30'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100">
              <CurrencySelector />
            </div>

            <div className="pt-3 border-t border-gray-100">
              {isAuthenticated && user ? (
                <div className="space-y-1">
                  <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5EA3C0] to-[#4891b0] text-white flex items-center justify-center font-semibold text-sm">
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{t('nav.profile')}</p>
                    </div>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-blue-600 font-semibold text-sm"
                      onClick={() => setMobileOpen(false)}
                    >
                      <ShieldAlert className="w-4 h-4 text-blue-600" />
                      Administration
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/auth/login" className="flex-1 text-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50">{t('nav.login')}</Link>
                  <Link to="/auth/register" className="flex-1 text-center px-4 py-2.5 bg-[#5EA3C0] text-white rounded-lg font-semibold text-sm hover:bg-[#4891b0]">{t('nav.register')}</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
    <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function MobileLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-[#5EA3C0]/10 text-[#5EA3C0]'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </Link>
  );
}