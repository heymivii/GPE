import { Link } from 'react-router-dom';
import { getAllServices } from '../../../data/services-config';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';

export default function ServicesIndexPage() {
  const services = getAllServices();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <PageHeader 
        title="Nos Services" 
        description="Tout ce dont vous avez besoin pour réussir votre expatriation. Des guides détaillés, des outils pratiques et des conseils d'experts pour chaque étape de votre projet."
      />

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
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
                  En savoir plus
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
