import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Briefcase, Home, Bus, Heart, Lock } from 'lucide-react';
import ServiceTools from '../../services/components/ServiceTools';

export default function LandingToolsSection() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('emploi');

  const categories = [
    { id: 'emploi', label: t('landing.tools.categories.emploi'), icon: Briefcase },
    { id: 'logement', label: t('landing.tools.categories.logement'), icon: Home },
    { id: 'transport', label: t('landing.tools.categories.transport'), icon: Bus },
    { id: 'sante', label: t('landing.tools.categories.sante'), icon: Heart },
  ];

  return (
    <section className="py-16 px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-outfit">
            {t('landing.tools.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('landing.tools.subtitle')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar / Tabs */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gray-900 text-white shadow-lg scale-105'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <cat.icon className={`w-5 h-5 ${activeCategory === cat.id ? 'text-white' : 'text-gray-500'}`} />
                <span className="font-medium">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Tool Display */}
          <div className="flex-1 w-full bg-gray-50 rounded-3xl p-2 border border-gray-100 shadow-sm min-h-[500px] relative">
             <div className="h-full bg-white rounded-2xl overflow-hidden relative">
                {/* Blur Overlay */}
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6">
                  <div className="bg-white p-4 rounded-full shadow-xl mb-4">
                    <Lock className="w-8 h-8 text-[#5EA3C0]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 font-outfit">
                    {t('landing.preview.title')}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    {t('landing.preview.description')}
                  </p>
                  <Link
                    to="/auth/register"
                    className="inline-flex items-center justify-center px-8 py-3 text-base font-bold text-white transition-all duration-200 bg-[#5EA3C0] border border-transparent rounded-full hover:bg-[#4d8a9d] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {t('landing.preview.cta')}
                  </Link>
                </div>

                {/* Tool Content (Non-interactive) */}
                <div className="pointer-events-none select-none filter blur-[1px]">
                  <ServiceTools 
                    category={activeCategory} 
                    isExpanded={true} 
                  />
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
