import { X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function GuestBanner() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 pr-8 sm:pr-0">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Sparkles className="w-5 h-5 text-[#5EA3C0] flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs sm:text-sm text-gray-700 leading-snug">
              <span className="font-semibold">{t('common.guestBanner.exploreFreely')}</span>{' '}
              <span className="hidden sm:inline">{t('common.guestBanner.signupMessage')}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-7 sm:ml-0">
            <Link
              to="/auth/register"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#5EA3C0] text-white text-xs sm:text-sm font-medium rounded-full hover:bg-[#4d8a9d] transition-colors whitespace-nowrap"
            >
              {t('common.guestBanner.createAccount')}
            </Link>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-0 right-0 sm:relative p-1 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={t('common.guestBanner.close')}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
