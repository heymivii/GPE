import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { destinationsApi } from '../../../api/destinations';
import { searchJobs } from '../../../api/jobOffers';
import { forumTopicsApi } from '../../../api/forum-topics';
import { migrationApi, type CountryMigrationData } from '../../../api/migration';
import type { CountryDetail } from '../types';
import type { AdzunaJobDto } from '../../search/types/job';
import type { ForumTopic } from '../../../types/forum';
import {
  Users,
  Briefcase,
  MessageSquare,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Globe,
  Sparkles,
  Building2,
  ArrowRight,
  MapPin,
  Clock,
  Eye,
  User,
  TrendingUp,
  TrendingDown,
  Shield,
  Award,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import AuthPromptCard from '../../../components/AuthPromptCard';
import CostOfLivingTab from '../components/CostOfLivingTab';
import { ISO2_TO_ISO3, getLocale, getCurrentLocale } from '../../../data/supportedCountries';

export function DestinationDetailPage() {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const dateLocale = getLocale(i18n.language);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'cities' | 'cost-of-living' | 'opportunities' | 'forum' | 'resources'
  >('overview');

  const { data: country, isLoading: loading, isError } = useQuery<CountryDetail>({
    queryKey: ['destination-detail', countrySlug],
    queryFn: () => destinationsApi.getBySlug(countrySlug!),
    enabled: !!countrySlug,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch preview jobs for this country (5 results)
  const countryCode = country?.isoCode?.toLowerCase();
  const { data: jobsData } = useQuery({
    queryKey: ['destination-jobs-preview', countryCode],
    queryFn: () => searchJobs({ country: countryCode, resultsPerPage: 5 }),
    enabled: !!countryCode,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch forum topics — filter client-side by country
  const { data: allTopics } = useQuery<ForumTopic[]>({
    queryKey: ['forum-topics'],
    queryFn: forumTopicsApi.findAll,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch OECD migration data for this country
  const iso2 = country?.isoCode?.toUpperCase();
  const { data: migrationData } = useQuery<CountryMigrationData | null>({
    queryKey: ['oecd-migration', iso2],
    queryFn: () => migrationApi.getByCountry(iso2!),
    enabled: !!iso2 && !!ISO2_TO_ISO3[iso2],
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const countryTopics = (allTopics || [])
    .filter(t => t.country?.idCountry === country?.idCountry)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !country) {
    return <Navigate to="/destinations" replace />;
  }

  const tabs = [
    { id: 'overview' as const, label: t('services.destinationDetail.overview') },
    { id: 'cities' as const, label: t('services.destinationDetail.cities') },
    { id: 'cost-of-living' as const, label: t('services.destinationDetail.costOfLiving') },
    { id: 'opportunities' as const, label: t('services.destinationDetail.opportunities') },
    { id: 'forum' as const, label: t('services.destinationDetail.forum') },
    { id: 'resources' as const, label: t('services.destinationDetail.resources') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <img
          src={country.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80'}
          alt={country.countryName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/destinations"
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('services.destinationDetail.backToDestinations')}
            </Link>
            <div className="flex items-center gap-4 mb-4">
              {country.flagUrl && (
                <img src={country.flagUrl} alt={country.countryName} className="w-12 h-12 rounded-full border-2 border-white shadow-lg" />
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-white font-outfit">{country.countryName}</h1>
            </div>
            <div className="flex items-center gap-6 text-white/90">
              <span className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {country.continent?.continentName}
              </span>
              <span className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {t('services.destinationDetail.citiesAvailable', { count: country.cities.length })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100">
                <nav className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
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
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{t('services.destinationDetail.about')}</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {country.description || t('services.destinationDetail.defaultDescription', { country: country.countryName })}
                      </p>
                    </div>

                    {/* Highlights (Mocked for now if not in DB) */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('services.destinationDetail.whyChoose', { country: country.countryName })}</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          t('services.destinationDetail.highlights.qualityOfLife'),
                          t('services.destinationDetail.highlights.careerOpportunities'),
                          t('services.destinationDetail.highlights.culturalRichness'),
                          t('services.destinationDetail.highlights.healthcareSystem')
                        ].map((highlight: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-[#5EA3C0] mt-0.5" />
                            <span className="text-gray-700">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'cities' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{t('services.destinationDetail.mainCities')}</h3>
                    {country.cities.length > 0 ? (
                      <div className="grid gap-6 sm:grid-cols-2">
                        {country.cities.map((city) => (
                          <div key={city.city_id} className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all">
                            <div className="relative h-40">
                              <img
                                src={city.imageUrl || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80'}
                                alt={city.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <h4 className="text-white font-bold text-lg">{city.name}</h4>
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                {city.description || t('services.destinationDetail.discoverCity', { city: city.name })}
                              </p>
                              <button className="text-[#5EA3C0] font-medium text-sm flex items-center hover:underline">
                                {t('services.destinationDetail.viewCity')} <ArrowRight className="w-4 h-4 ml-1" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">{t('services.destinationDetail.noCities')}</p>
                    )}
                  </div>
                )}

                {activeTab === 'cost-of-living' && (
                  <CostOfLivingTab
                    cities={country.cities}
                    countryCurrency={country.currency || 'EUR'}
                    averageHousing={country.costOfLiving?.averageHousing}
                    costCurrency={country.costOfLiving?.currency}
                  />
                )}

                {activeTab === 'opportunities' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{t('services.destinationDetail.professionalOpportunities')}</h3>
                      <span className="text-sm text-gray-500">{t('services.destinationDetail.totalOffers', { count: jobsData?.total || 0 })}</span>
                    </div>

                    {jobsData && jobsData.results.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {jobsData.results.map((job: AdzunaJobDto) => (
                            <a
                              key={job.id}
                              href={job.redirect_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-[#5EA3C0]/30 rounded-xl p-4 transition-all group"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 group-hover:text-[#5EA3C0] transition-colors truncate">
                                    {job.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">{job.company}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5" />
                                      {job.location?.displayName || job.location?.city}
                                    </span>
                                    {job.salary && (
                                      <span className="font-medium text-green-600">
                                        {Math.round(job.salary.min).toLocaleString()} – {Math.round(job.salary.max).toLocaleString()} {job.salary.currency}
                                      </span>
                                    )}
                                    {job.contract_type && (
                                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{job.contract_type}</span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      {new Date(job.created_at).toLocaleDateString(dateLocale)}
                                    </span>
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#5EA3C0] flex-shrink-0 mt-1 transition-colors" />
                              </div>
                            </a>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-gray-100 text-center">
                          <Link
                            to={`/search?country=${countryCode}`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5EA3C0] text-white font-medium rounded-xl hover:bg-[#4d8a9d] transition-colors"
                          >
                            {t('services.destinationDetail.viewAllOffers', { count: jobsData.total })}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">{t('services.destinationDetail.noOffers')}</p>
                        <Link
                          to={`/search?country=${countryCode}`}
                          className="inline-flex items-center gap-2 text-[#5EA3C0] font-medium hover:underline"
                        >
                          {t('services.destinationDetail.searchOffers')} <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'forum' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{t('services.destinationDetail.communityDiscussion')}</h3>
                      <span className="text-sm text-gray-500">{t('services.destinationDetail.subjects', { count: country.stats?.forumTopicsCount || 0 })}</span>
                    </div>

                    {countryTopics.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {countryTopics.map((topic) => (
                            <Link
                              key={topic.topic_id}
                              to={`/forum/post/${topic.topic_id}`}
                              className="block bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-[#5EA3C0]/30 rounded-xl p-4 transition-all group"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {topic.category && (
                                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        topic.category === 'question' ? 'bg-purple-100 text-purple-700' :
                                        topic.category === 'testimony' ? 'bg-green-100 text-green-700' :
                                        topic.category === 'advice' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-600'
                                      }`}>
                                        {topic.category === 'question' ? t('services.destinationDetail.question') :
                                         topic.category === 'testimony' ? t('services.destinationDetail.testimony') :
                                         topic.category === 'advice' ? t('services.destinationDetail.advice') :
                                         topic.category === 'discussion' ? t('services.destinationDetail.discussion') :
                                         topic.category}
                                      </span>
                                    )}
                                    {topic.is_pinned && (
                                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{t('services.destinationDetail.pinned')}</span>
                                    )}
                                  </div>
                                  <h4 className="font-semibold text-gray-900 group-hover:text-[#5EA3C0] transition-colors">
                                    {topic.title}
                                  </h4>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <User className="w-3.5 h-3.5" />
                                      {topic.user?.fullName || t('services.destinationDetail.anonymous')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      {new Date(topic.created_at).toLocaleDateString(dateLocale)}
                                    </span>
                                    {topic.views_count != null && (
                                      <span className="flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" />
                                        {t('services.destinationDetail.views', { count: topic.views_count })}
                                      </span>
                                    )}
                                    {topic.messages && topic.messages.length > 0 && (
                                      <span className="flex items-center gap-1">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        {t('services.destinationDetail.replies', { count: topic.messages.length })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#5EA3C0] flex-shrink-0 mt-1 transition-colors" />
                              </div>
                            </Link>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-gray-100 text-center">
                          <Link
                            to={`/forum?country=${country.isoCode}`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5EA3C0] text-white font-medium rounded-xl hover:bg-[#4d8a9d] transition-colors"
                          >
                            {t('services.destinationDetail.viewAllTopics', { count: country.stats?.forumTopicsCount || 0 })}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">{t('services.destinationDetail.noTopics', { country: country.countryName })}</p>
                        <Link
                          to={`/forum?country=${country.isoCode}`}
                          className="inline-flex items-center gap-2 text-[#5EA3C0] font-medium hover:underline"
                        >
                          {t('services.destinationDetail.accessForum')} <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('services.destinationDetail.guidesAndResources')}</h3>
                    <p className="text-gray-500 mb-6">{t('services.destinationDetail.guidesDescription', { count: country.stats?.resourcesCount || 0, country: country.countryName })}</p>
                    <Link to={`/resources?country=${country.isoCode}`} className="text-[#5EA3C0] font-medium hover:underline">
                      {t('services.destinationDetail.viewResources')} &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">{t('services.destinationDetail.statistics')}</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>{t('services.destinationDetail.members')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{(country.stats?.memberCount || 0).toLocaleString(getCurrentLocale())}</span>
                </div>
                <div className="w-full bg-gray-100 h-px"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Briefcase className="w-5 h-5" />
                    <span>{t('services.destinationDetail.jobOffers')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{country.stats?.jobOffersCount || 0}</span>
                </div>
                <div className="w-full bg-gray-100 h-px"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MessageSquare className="w-5 h-5" />
                    <span>{t('services.destinationDetail.forumTopics')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{country.stats?.forumTopicsCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Migration Statistics (OECD) */}
            {migrationData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#5EA3C0]" />
                  {t('services.destinationDetail.migrationStats.title')}
                </h3>
                <div className="space-y-5">
                  {migrationData.stocksForeignPop && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-1">
                        <Users className="w-3.5 h-3.5" />
                        {t('services.destinationDetail.migrationStats.foreignPop')}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {migrationData.stocksForeignPop.value.toLocaleString(dateLocale)}
                        </span>
                        <span className="text-xs text-gray-400">({migrationData.stocksForeignPop.year})</span>
                      </div>
                    </div>
                  )}

                  {migrationData.inflowsForeignPop && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        {t('services.destinationDetail.migrationStats.inflows')}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          +{migrationData.inflowsForeignPop.value.toLocaleString(dateLocale)}
                        </span>
                        <span className="text-xs text-gray-400">({migrationData.inflowsForeignPop.year})</span>
                      </div>
                    </div>
                  )}

                  {migrationData.outflowsForeignPop && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-1">
                        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                        {t('services.destinationDetail.migrationStats.outflows')}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          -{migrationData.outflowsForeignPop.value.toLocaleString(dateLocale)}
                        </span>
                        <span className="text-xs text-gray-400">({migrationData.outflowsForeignPop.year})</span>
                      </div>
                    </div>
                  )}

                  {migrationData.asylumSeekers && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-1">
                        <Shield className="w-3.5 h-3.5" />
                        {t('services.destinationDetail.migrationStats.asylum')}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          {migrationData.asylumSeekers.value.toLocaleString(dateLocale)}
                        </span>
                        <span className="text-xs text-gray-400">({migrationData.asylumSeekers.year})</span>
                      </div>
                    </div>
                  )}

                  {migrationData.nationalityAcquisitions && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {t('services.destinationDetail.migrationStats.nationality')}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          {migrationData.nationalityAcquisitions.value.toLocaleString(dateLocale)}
                        </span>
                        <span className="text-xs text-gray-400">({migrationData.nationalityAcquisitions.year})</span>
                      </div>
                    </div>
                  )}
                </div>

                <p className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400">
                  {t('services.destinationDetail.migrationStats.source')}
                </p>
              </div>
            )}

            {!isAuthenticated && (
              <AuthPromptCard
                icon={Sparkles}
                title={t('services.destinationDetail.createProjectTitle')}
                description={t('services.destinationDetail.createProjectDesc', { memberCount: (country.stats?.memberCount || 0).toLocaleString(getCurrentLocale()), country: country.countryName })}
                ctaText={t('services.destinationDetail.createFreeAccount')}
                ctaLink="/auth/register"
                benefits={[
                  t('services.destinationDetail.benefits.personalizedTracking'),
                  t('services.destinationDetail.benefits.exclusiveJobs'),
                  t('services.destinationDetail.benefits.communityConnection'),
                  t('services.destinationDetail.benefits.detailedGuides')
                ]}
              />
            )}

            <div className="bg-[#5EA3C0] rounded-xl shadow-sm p-6 text-white">
              <h3 className="font-bold text-lg mb-4">{t('services.destinationDetail.readyToGo')}</h3>
              <p className="text-blue-50 text-sm mb-6">
                {t('services.destinationDetail.startProject', { country: country.countryName })}
              </p>
              <div className="space-y-3">
                <Link
                  to={`/search?country=${country.isoCode}`}
                  className="block w-full py-3 px-4 bg-white text-[#5EA3C0] text-center font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {t('services.destinationDetail.findJob')}
                </Link>
                <Link
                  to={`/forum?country=${country.isoCode}`}
                  className="block w-full py-3 px-4 bg-[#4a8aa3] text-white text-center font-medium rounded-lg hover:bg-[#3d758a] transition-colors"
                >
                  {t('services.destinationDetail.discussOnForum')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
