import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const faqKeys = ['1', '2', '3', '4', '5', '6'];

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-outfit">
            {t('landing.faq.title')}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {t('landing.faq.subtitle')}
          </p>
        </div>

        <div className="space-y-3">
          {faqKeys.map((key, index) => (
            <div
              key={key}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium text-gray-900 pr-4">
                  {t(`landing.faq.items.${key}.question`)}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''
                    }`}
                />
              </button>
              <div
                className={`grid transition-all duration-200 ease-in-out ${openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {t(`landing.faq.items.${key}.answer`)}
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
