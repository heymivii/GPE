import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ServiceConfig } from '../../../data/services-config';

interface ServiceHeaderProps {
  service: ServiceConfig;
}

export default function ServiceHeader({ service }: ServiceHeaderProps) {
  const Icon = service.icon as LucideIcon;

  return (
    <div className="relative overflow-hidden bg-white border-b border-gray-100">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm font-medium text-gray-500 mb-8">
          <Link to="/" className="hover:text-gray-900 transition-colors">
            Accueil
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <Link to="/#services" className="hover:text-gray-900 transition-colors">
            Nos services
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="text-gray-900">{service.title}</span>
        </nav>

        {/* Header Content */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div
            className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center`}
          >
            <Icon className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              {service.title}
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl leading-relaxed font-light">
              {service.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
