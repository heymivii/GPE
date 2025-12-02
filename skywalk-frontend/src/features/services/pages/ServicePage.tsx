import { useParams, Navigate, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { getServiceBySlug } from '../../../data/services-config';
import { PageHeader } from '../../../components/PageHeader';
import ServiceGuides from '../components/ServiceGuides';
import ServiceStats from '../components/ServiceStats';
import ServiceResults from '../components/ServiceResults';
import CountrySelector from '../components/CountrySelector';
import ServiceTools from '../components/ServiceTools';
import { useServiceContent } from '../hooks/useServiceContent';

export default function ServicePage() {
  const { category } = useParams<{ category: string }>();
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);

  // Récupérer le service d'abord
  const service = category ? getServiceBySlug(category) : null;

  // Appeler le hook avant les early returns
  const {
    content,
    selectedCountry,
    setSelectedCountry,
    displayMode,
    isAuthenticated,
  } = useServiceContent({ 
    service: service || { guides: [], tips: [], stats: [] } as any, 
    category: category || '' 
  });

  // Early returns après les hooks
  if (!category) {
    return <Navigate to="/" replace />;
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Service non trouvé
          </h1>
          <p className="text-gray-600 mb-6">
            Le service "{category}" n'existe pas ou n'est plus disponible.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <PageHeader 
        title={service.title} 
        description={service.description} 
      />

      {/* Context Banner - Full Width */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              {displayMode === 'generic' && (
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold mb-3 uppercase tracking-wider">
                    Mode découverte
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Informations générales
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Découvrez nos guides et conseils universels pour réussir votre expatriation.
                  </p>
                  {!isAuthenticated && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <Plus className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <p className="text-xs text-gray-700">
                        <Link to="/auth/register" className="font-semibold text-gray-900 hover:text-gray-700 underline">
                          Créez un compte gratuit
                        </Link>
                        {' '}pour accéder à du contenu personnalisé !
                      </p>
                    </div>
                  )}
                </div>
              )}

              {displayMode === 'with-project' && (
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#5EA3C0]/10 text-[#5EA3C0] text-xs font-bold mb-3 uppercase tracking-wider">
                    Personnalisé
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {content.hasCountryContent ? (
                      <>Expatriation en <span className="capitalize">{selectedCountry}</span></>
                    ) : (
                      'Informations de votre projet'
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {content.hasCountryContent
                      ? 'Contenu adapté spécifiquement pour votre destination.'
                      : 'Utilisez le sélecteur pour voir le contenu spécifique à un pays.'}
                  </p>
                </div>
              )}

              {displayMode === 'without-project' && (
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold mb-3 uppercase tracking-wider">
                    Exploration
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Explorez par destination
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Sélectionnez un pays pour accéder à des informations précises.
                  </p>
                  <Link
                    to="/onboarding"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Créer mon projet</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Country Selector */}
            {isAuthenticated && (
              <div className="w-full lg:w-auto flex-shrink-0">
                <CountrySelector
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                  showGenericOption={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area with Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Tools */}
          <aside className={`flex-shrink-0 transition-all duration-300 ${
            isToolsExpanded ? 'lg:w-96' : 'lg:w-80'
          }`}>
            <div className="lg:sticky lg:top-8 space-y-6">
              <ServiceTools 
                category={category || ''} 
                countryName={selectedCountry || undefined}
                isExpanded={isToolsExpanded}
                onToggleExpand={() => setIsToolsExpanded(!isToolsExpanded)}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-8">
            {/* Stats Section */}
            {content.stats && content.stats.length > 0 && (
              <ServiceStats stats={content.stats} color={service.color} />
            )}

            {/* Guides Section */}
            <ServiceGuides
              guides={content.guides}
              tips={content.tips}
              faq={service.faq}
            />

            {/* Search Results Section */}
            {service.searchCategory && (
              <ServiceResults
                category={service.searchCategory}
                title={service.title}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
