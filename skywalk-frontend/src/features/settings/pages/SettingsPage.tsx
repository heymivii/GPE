import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Coins, Languages, User as UserIcon, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { useCurrency, DISPLAY_CURRENCIES } from '../../../contexts/CurrencyContext';
import { useAuth } from '../../../hooks/useAuth';

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { displayCurrency, setDisplayCurrency } = useCurrency();
  const { user } = useAuth();

  const currentLang = i18n?.language || 'fr';
  const changeLanguage = (code: string) => {
    if (i18n && typeof i18n.changeLanguage === 'function') i18n.changeLanguage(code);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={t('settings.title', { defaultValue: 'Réglages' })}
        description={t('settings.subtitle', {
          defaultValue: 'Vos préférences d’affichage et votre compte.',
        })}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Préférences */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {t('settings.preferences', { defaultValue: 'Préférences' })}
          </h2>

          {/* Devise */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
              <Coins className="w-4 h-4 text-gray-400" />
              {t('settings.currency', { defaultValue: 'Devise d’affichage' })}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DISPLAY_CURRENCIES.map((cur) => (
                <button
                  key={cur.code}
                  onClick={() => setDisplayCurrency(cur.code)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    displayCurrency === cur.code
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cur.symbol} {cur.code}
                </button>
              ))}
            </div>
          </div>

          {/* Langue */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
              <Languages className="w-4 h-4 text-gray-400" />
              {t('settings.language', { defaultValue: 'Langue' })}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    currentLang === lang.code
                      ? 'bg-[#5EA3C0]/10 text-[#5EA3C0] border-[#5EA3C0]/30'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Compte */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {t('settings.account', { defaultValue: 'Compte' })}
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5EA3C0] to-[#4891b0] text-white flex items-center justify-center font-semibold">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-[#5EA3C0] hover:underline"
          >
            <UserIcon className="w-4 h-4" />
            {t('settings.viewProfile', { defaultValue: 'Modifier mon profil' })}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
