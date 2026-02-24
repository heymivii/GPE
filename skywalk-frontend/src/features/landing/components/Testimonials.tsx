import { Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const testimonials = [
  { key: '1', flag: '🇯🇵' },
  { key: '2', flag: '🇨🇭' },
  { key: '3', flag: '🇺🇸' },
];

export default function Testimonials() {
  const { t } = useTranslation();

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-outfit">
            {t('landing.testimonials.title')}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {t('landing.testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div
              key={item.key}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <Quote className="w-8 h-8 text-gray-200 mb-4" />
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{t(`landing.testimonials.items.${item.key}.quote`)}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                  {item.flag}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {t(`landing.testimonials.items.${item.key}.name`)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t(`landing.testimonials.items.${item.key}.role`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
