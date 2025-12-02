import { Link } from 'react-router';
import type { Destination } from '../types';
import { Users, Briefcase, ArrowRight } from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
}

/**
 * Card component displaying a destination with its statistics
 * Redesigned for a spacious, modern, and soft look.
 */
export function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link
      to={`/destinations/${destination.slug}`}
      className="group relative flex flex-col bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 border border-gray-100 hover:border-blue-100 overflow-hidden h-full"
    >
      <div className="p-8 flex flex-col h-full">
        {/* Header: Flag & Continent */}
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded-2xl text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">
            {destination.flagEmoji}
          </div>
          <span className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider rounded-full border border-gray-100">
            {destination.continent}
          </span>
        </div>
        
        {/* Content: Title & Description */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#5EA3C0] transition-colors font-outfit">
            {destination.name}
          </h3>
          <p className="text-gray-500 text-base leading-relaxed line-clamp-2">
            {destination.description}
          </p>
        </div>

        {/* Footer: Stats & Action */}
        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-400" title="Membres">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium text-gray-600">
                {destination.stats.memberCount > 1000 
                  ? `${(destination.stats.memberCount / 1000).toFixed(1)}k` 
                  : destination.stats.memberCount}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400" title="Offres d'emploi">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-medium text-gray-600">
                {destination.stats.jobOffersCount}
              </span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#5EA3C0] group-hover:text-white transition-all duration-300">
            <ArrowRight className="w-5 h-5 transform group-hover:-rotate-45 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
}
