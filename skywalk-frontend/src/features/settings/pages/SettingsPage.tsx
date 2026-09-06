import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Coins, Languages, User as UserIcon, ArrowRight, BadgeCheck } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { useCurrency, DISPLAY_CURRENCIES } from '../../../contexts/CurrencyContext';
import { useAuth } from '../../../hooks/useAuth';
import { userApi } from '../../../api/user';
import { expertsApi } from '../../../api/experts';

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

  // F1/F3 — profil expert (visible seulement pour un expert vérifié).
  const { data: me } = useQuery<any>({ queryKey: ['me'], queryFn: () => userApi.getProfile() });
  const isVerifiedExpert = !!(me?.isExpert && me?.expertVerifiedAt);
  const [expertTitle, setExpertTitle] = useState('');
  const [expertBio, setExpertBio] = useState('');
  useEffect(() => {
    if (me) {
      setExpertTitle(me.expertTitle ?? '');
      setExpertBio(me.expertBio ?? '');
    }
  }, [me]);
  const expertMutation = useMutation({
    mutationFn: () => expertsApi.updateMyProfile({ expertTitle, expertBio }),
    onSuccess: () => toast.success(t('settings.expert.saved', { defaultValue: 'Profil expert mis à jour' })),
    onError: () => toast.error(t('common.error', { defaultValue: 'Une erreur est survenue' })),
  });

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
                      ? 'bg-brand-ink/10 text-brand-ink border-brand/30'
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-deep text-white flex items-center justify-center font-semibold">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-brand-ink hover:underline"
          >
            <UserIcon className="w-4 h-4" />
            {t('settings.viewProfile', { defaultValue: 'Modifier mon profil' })}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>

        {/* Profil expert — visible seulement pour un expert vérifié (F1). */}
        {isVerifiedExpert && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              {t('settings.expert.title', { defaultValue: 'Profil expert' })}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {t('settings.expert.subtitle', {
                defaultValue: 'Votre titre et votre bio publics. La vérification est gérée par l’équipe.',
              })}
            </p>
            <div className="space-y-3">
              <input
                value={expertTitle}
                onChange={(e) => setExpertTitle(e.target.value)}
                maxLength={120}
                placeholder={t('experts.admin.titlePlaceholder', { defaultValue: 'Titre' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-brand outline-none"
              />
              <textarea
                value={expertBio}
                onChange={(e) => setExpertBio(e.target.value)}
                rows={3}
                placeholder={t('experts.admin.bioPlaceholder', { defaultValue: 'Bio' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-brand outline-none resize-none"
              />
              <button
                onClick={() => expertMutation.mutate()}
                disabled={expertMutation.isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-ink rounded-lg hover:bg-brand-ink-hover disabled:opacity-50"
              >
                {t('common.save', { defaultValue: 'Enregistrer' })}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
