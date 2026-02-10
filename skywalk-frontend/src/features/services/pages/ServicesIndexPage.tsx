import { Link } from 'react-router-dom';
import { getServicesForIndex } from '../../../data/services-config';
import { ArrowRight, Lock } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { useTranslation } from 'react-i18next';

export default function ServicesIndexPage() {
  const { t } = useTranslation();
  const services = getServicesForIndex(t);

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title={t('services.indexPage.title')}
        description={t('services.indexPage.description')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;

            if (service.comingSoon) {
              return (
                <div
                  key={service.id}
                  className="relative block bg-gray-50 rounded-2xl border border-gray-200 p-8 opacity-60 cursor-default select-none"
                >
                  {/* Coming soon badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-gray-200 rounded-full">
                    <Lock className="w-3 h-3 text-gray-500" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {t('services.indexPage.comingSoon', 'À venir')}
                    </span>
                  </div>

                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-gray-400" strokeWidth={1.5} />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-400 mb-3">
                    {service.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed mb-4 line-clamp-3">
                    {service.description}
                  </p>
                </div>
              );
            }

            return (
              <Link 
                key={service.id} 
                to={`/services/${service.id}`}
                className="group block bg-white rounded-2xl border border-gray-200 p-8 hover:border-[#5EA3C0] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-[#5EA3C0]/10 flex items-center justify-center group-hover:bg-[#5EA3C0] transition-colors duration-300">
                    <Icon className="w-7 h-7 text-[#5EA3C0] group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#5EA3C0]/10 transition-colors">
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#5EA3C0] transition-colors" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#5EA3C0] transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-500 leading-relaxed mb-4 line-clamp-3">
                  {service.description}
                </p>

                <div className="flex items-center text-sm font-medium text-[#5EA3C0] opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  {t('services.indexPage.learnMore')}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
