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
import HealthStats from '../components/HealthStats';
import TransportStats from '../components/TransportStats';
import LogementStats from '../components/LogementStats';
import EmploiStats from '../components/EmploiStats';
import { useServiceContent } from '../hooks/useServiceContent';
import { useTranslation } from 'react-i18next';

export default function ServicePage() {
  const { t } = useTranslation();
  const { category } = useParams<{ category: string }>();
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);

  // Récupérer le service d'abord
  const service = category ? getServiceBySlug(category, t) : null;

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
            {t('services.servicePage.notFound.title')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('services.servicePage.notFound.description', { category })}
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            {t('services.servicePage.notFound.backHome')}
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
                    {t('services.servicePage.modes.discovery.badge')}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {t('services.servicePage.modes.discovery.title')}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t('services.servicePage.modes.discovery.description')}
                  </p>
                  {!isAuthenticated && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <Plus className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <p className="text-xs text-gray-700">
                        <Link to="/auth/register" className="font-semibold text-gray-900 hover:text-gray-700 underline">
                          {t('services.servicePage.modes.discovery.cta')}
                        </Link>
                        {' '}{t('services.servicePage.modes.discovery.ctaSuffix')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {displayMode === 'with-project' && (
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#5EA3C0]/10 text-[#5EA3C0] text-xs font-bold mb-3 uppercase tracking-wider">
                    {t('services.servicePage.modes.personalized.badge')}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {content.hasCountryContent ? (
                      <>{t('services.servicePage.modes.personalized.titleWithCountry', { country: selectedCountry })}</>
                    ) : (
                      t('services.servicePage.modes.personalized.titleWithoutCountry')
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {content.hasCountryContent
                      ? t('services.servicePage.modes.personalized.descriptionWithCountry')
                      : t('services.servicePage.modes.personalized.descriptionWithoutCountry')}
                  </p>
                </div>
              )}

              {displayMode === 'without-project' && (
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold mb-3 uppercase tracking-wider">
                    {t('services.servicePage.modes.exploration.badge')}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {t('services.servicePage.modes.exploration.title')}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {t('services.servicePage.modes.exploration.description')}
                  </p>
                  <Link
                    to="/onboarding"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('services.servicePage.modes.exploration.cta')}</span>
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
          {/* Sidebar - Tools (uniquement pour utilisateurs connectés) */}
          {isAuthenticated && (
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
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-8">
            {/* Stats Section - Dynamique pour tous les services avec données complètes */}
            {selectedCountry && ['france', 'royaume-uni', 'suisse'].includes(selectedCountry) ? (
              <>
                {category === 'sante' && <HealthStats countryName={selectedCountry} />}
                {category === 'transport' && <TransportStats countryName={selectedCountry} />}
                {category === 'logement' && <LogementStats countryName={selectedCountry} />}
                {category === 'emploi' && <EmploiStats countryName={selectedCountry} />}
                {!['sante', 'transport', 'logement', 'emploi'].includes(category || '') && 
                  content.stats && content.stats.length > 0 && (
                    <ServiceStats stats={content.stats} color={service.color} />
                  )}
              </>
            ) : content.stats && content.stats.length > 0 ? (
              <ServiceStats stats={content.stats} color={service.color} />
            ) : null}

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
