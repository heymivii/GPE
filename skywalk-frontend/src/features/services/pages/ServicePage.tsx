import { useParams, Navigate, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
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
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <PageHeader 
        title={service.title} 
        description={service.description} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Country Selector + Context Banner */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              {displayMode === 'generic' && (
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium mb-4 uppercase tracking-wide">
                    Mode découverte
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Informations générales
                  </h3>
                  <p className="text-gray-500 leading-relaxed mb-4">
                    Découvrez nos guides et conseils universels pour réussir votre expatriation, quelle que soit votre destination.
                  </p>
                  {!isAuthenticated && (
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#5EA3C0] rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 mb-2">
                          <strong>💡 Astuce :</strong> Créez un compte gratuit pour accéder à du contenu personnalisé selon votre pays de destination !
                        </p>
                        <Link
                          to="/auth/register"
                          className="inline-flex items-center text-sm font-semibold text-[#5EA3C0] hover:text-[#4d8a9d] underline"
                        >
                          Créer mon compte →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {displayMode === 'with-project' && (
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mb-4 uppercase tracking-wide">
                    Personnalisé
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {content.hasCountryContent ? (
                      <>
                        Tout savoir sur l'expatriation en{' '}
                        <span className="text-gray-900 capitalize">
                          {selectedCountry}
                        </span>
                      </>
                    ) : (
                      'Informations de votre projet'
                    )}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {content.hasCountryContent
                      ? 'Nous avons adapté tous les guides, chiffres et conseils ci-dessous spécifiquement pour votre destination.'
                      : 'Utilisez le sélecteur pour voir le contenu spécifique à un pays.'}
                  </p>
                </div>
              )}

              {displayMode === 'without-project' && (
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium mb-4 uppercase tracking-wide">
                    Exploration
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Explorez par destination
                  </h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">
                    Sélectionnez un pays dans la liste pour accéder à des informations précises et adaptées.
                  </p>
                  <Link
                    to="/onboarding"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
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

        {/* Stats Section */}
        {content.stats && content.stats.length > 0 && (
          <ServiceStats stats={content.stats} color={service.color} />
        )}

        {/* Interactive Tools Section */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <ServiceTools category={category || ''} countryName={selectedCountry || undefined} />
        </div>

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
      </div>
    </div>
  );
}
