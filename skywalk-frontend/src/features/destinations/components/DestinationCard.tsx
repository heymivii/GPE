import { Link } from 'react-router';
import type { Destination } from '../types';
import { Users, Briefcase, MessageSquare, BookOpen, ArrowRight } from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
}

/**
 * Card component displaying a destination with its statistics
 */
export function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link
      to={`/destinations/${destination.slug}`}
      className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1"
    >
      {/* Header with Flag */}
      <div className="p-6 pb-0">
        <div className="flex justify-between items-start mb-4">
          <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-2xl text-4xl shadow-inner">
            {destination.flagEmoji}
          </div>
          <span className="px-3 py-1 bg-blue-50 text-[#5EA3C0] text-xs font-bold uppercase tracking-wider rounded-full">
            {destination.continent}
          </span>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#5EA3C0] transition-colors font-outfit">
          {destination.name}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-6 h-10">
          {destination.description}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="px-6 py-4 bg-gray-50 mt-auto border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-[#5EA3C0]" />
            <span className="font-medium text-gray-900">{destination.stats.memberCount.toLocaleString('fr-FR')}</span>
            <span className="text-xs hidden sm:inline">membres</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase className="w-4 h-4 text-[#5EA3C0]" />
            <span className="font-medium text-gray-900">{destination.stats.jobOffersCount}</span>
            <span className="text-xs hidden sm:inline">offres</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageSquare className="w-4 h-4 text-[#5EA3C0]" />
            <span className="font-medium text-gray-900">{destination.stats.forumTopicsCount}</span>
            <span className="text-xs hidden sm:inline">sujets</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4 text-[#5EA3C0]" />
            <span className="font-medium text-gray-900">{destination.stats.resourcesCount}</span>
            <span className="text-xs hidden sm:inline">guides</span>
          </div>
        </div>
      </div>
      
      {/* Hover Action */}
      <div className="px-6 py-3 bg-white border-t border-gray-100 flex items-center justify-between text-[#5EA3C0] font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span>Voir la destination</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
