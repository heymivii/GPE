import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router';
import { getDestinationBySlug } from '../mockData';
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  BookOpen, 
  ArrowLeft, 
  CheckCircle2,
  Globe
} from 'lucide-react';

/**
 * Detailed page for a specific destination country
 */
export function DestinationDetailPage() {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'opportunities' | 'forum' | 'resources'
  >('overview');

  const destination = countrySlug
    ? getDestinationBySlug(countrySlug)
    : undefined;

  if (!destination) {
    return <Navigate to="/destinations" replace />;
  }

  const tabs = [
    { id: 'overview' as const, label: 'Vue d\'ensemble' },
    { id: 'opportunities' as const, label: 'Opportunités' },
    { id: 'forum' as const, label: 'Forum' },
    { id: 'resources' as const, label: 'Ressources' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/destinations"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux destinations
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-6xl">{destination.flagEmoji}</span>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-outfit">{destination.name}</h1>
                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                      <Globe className="w-4 h-4" />
                      <span>{destination.continent}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {destination.description}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100">
                <nav className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-[#5EA3C0] text-[#5EA3C0]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Points forts</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {destination.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-[#5EA3C0] mt-0.5" />
                            <span className="text-gray-700">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'opportunities' && (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Opportunités professionnelles</h3>
                    <p className="text-gray-500 mb-6">Explorez les {destination.stats.jobOffersCount} offres d'emploi disponibles.</p>
                    <Link to={`/search?country=${destination.slug}`} className="text-[#5EA3C0] font-medium hover:underline">
                      Voir les offres &rarr;
                    </Link>
                  </div>
                )}

                {activeTab === 'forum' && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Discussion communautaire</h3>
                    <p className="text-gray-500 mb-6">Rejoignez les {destination.stats.forumTopicsCount} discussions sur le forum.</p>
                    <Link to={`/forum?country=${destination.slug}`} className="text-[#5EA3C0] font-medium hover:underline">
                      Accéder au forum &rarr;
                    </Link>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Guides et ressources</h3>
                    <p className="text-gray-500 mb-6">Consultez nos {destination.stats.resourcesCount} guides pour votre installation.</p>
                    <Link to={`/resources?country=${destination.slug}`} className="text-[#5EA3C0] font-medium hover:underline">
                      Voir les ressources &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">Statistiques</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>Membres</span>
                  </div>
                  <span className="font-semibold text-gray-900">{destination.stats.memberCount.toLocaleString('fr-FR')}</span>
                </div>
                <div className="w-full bg-gray-100 h-px"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Briefcase className="w-5 h-5" />
                    <span>Offres d'emploi</span>
                  </div>
                  <span className="font-semibold text-gray-900">{destination.stats.jobOffersCount}</span>
                </div>
                <div className="w-full bg-gray-100 h-px"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MessageSquare className="w-5 h-5" />
                    <span>Sujets forum</span>
                  </div>
                  <span className="font-semibold text-gray-900">{destination.stats.forumTopicsCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#5EA3C0] rounded-xl shadow-sm p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Prêt à partir ?</h3>
              <p className="text-blue-50 text-sm mb-6">
                Commencez votre projet d'expatriation en {destination.name} dès aujourd'hui.
              </p>
              <div className="space-y-3">
                <Link
                  to={`/search?country=${destination.slug}`}
                  className="block w-full py-3 px-4 bg-white text-[#5EA3C0] text-center font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Trouver un emploi
                </Link>
                <Link
                  to={`/forum?country=${destination.slug}`}
                  className="block w-full py-3 px-4 bg-[#4a8aa3] text-white text-center font-medium rounded-lg hover:bg-[#3d758a] transition-colors"
                >
                  Discuter sur le forum
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mockDestinations = { length: 12 };
