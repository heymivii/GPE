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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Sparkles className="w-5 h-5 text-[#5EA3C0] flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{t('common.guestBanner.exploreFreely')}</span> {t('common.guestBanner.signupMessage')}
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/auth/register"
              className="px-4 py-2 bg-[#5EA3C0] text-white text-sm font-medium rounded-full hover:bg-[#4d8a9d] transition-colors whitespace-nowrap"
            >
              {t('common.guestBanner.createAccount')}
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={t('common.guestBanner.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
