import { Briefcase, ExternalLink, TrendingUp, Globe, MapPin, GraduationCap, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { CountryData } from '../../../hooks/useCountryData'
import { searchJobs } from '../../../api/jobOffers'
import type { AdzunaSearchResponse } from '../../search/types/job'
import Widget from './Widget'
import { useTranslation } from 'react-i18next'
import type { WidgetSize } from '../hooks/useDashboardPreferences'

interface JobOpportunitiesWidgetProps {
  countryData?: CountryData | null
  userProfile?: {
    age?: number
    status?: string
    mainObjective?: string
    languages?: string[]
  }
  onEdit?: () => void
  onHide?: () => void
  onResize?: (size: WidgetSize) => void
  currentSize?: WidgetSize
}

/** ISO-2 → Adzuna lowercase country code */
const ISO_TO_ADZUNA: Record<string, string> = {
  FR: 'fr', GB: 'gb', US: 'us', CA: 'ca', DE: 'de',
  AU: 'au', BE: 'be', CH: 'ch', IT: 'it', NL: 'nl',
  ES: 'es', BR: 'br', MX: 'mx', NZ: 'nz', SG: 'sg',
  SE: 'se', PT: 'pt', JP: 'jp',
}

// Country-specific programs for expatriates
const COUNTRY_PROGRAMS: Record<string, Array<{ name: string; descKey: string; url?: string; icon: 'globe' | 'graduation' | 'users' }>> = {
  JP: [
    { name: 'JET Programme', descKey: 'dashboard.personalized.widgets.jobOpportunities.programs.jet', url: 'https://jetprogramme.org', icon: 'graduation' },
    { name: 'CCIFJ', descKey: 'dashboard.personalized.widgets.jobOpportunities.programs.ccifj', url: 'https://www.ccifj.or.jp', icon: 'users' },
  ],
  CA: [
    { name: 'Express Entry', descKey: 'dashboard.personalized.widgets.jobOpportunities.programs.expressEntry', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html', icon: 'globe' },
    { name: 'PVT Canada', descKey: 'dashboard.personalized.widgets.jobOpportunities.programs.pvtCanada', url: 'https://pvtistes.net/canada/', icon: 'users' },
  ],
  AU: [
    { name: 'Working Holiday', descKey: 'dashboard.personalized.widgets.jobOpportunities.programs.whvAustralia', url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417', icon: 'globe' },
    { name: 'Skilled Migration', descKey: 'dashboard.personalized.widgets.jobOpportunities.programs.skilledAustralia', url: 'https://immi.homeaffairs.gov.au/visas/working-in-australia', icon: 'users' },
  ],
  DE: [
    { name: 'Make it in Germany', descKey: 'dashboard.personalized.widgets.jobOpportunities.programs.makeItGermany', url: 'https://www.make-it-in-germany.com', icon: 'globe' },
    { name: 'Blue Card EU', descKey: 'dashboard.personalized.widgets.jobOpportunities.programs.blueCard', url: 'https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card', icon: 'graduation' },
  ],
  GB: [
    { name: 'Skilled Worker Visa', descKey: 'dashboard.personalized.widgets.jobOpportunities.programs.skilledWorkerUK', url: 'https://www.gov.uk/skilled-worker-visa', icon: 'globe' },
    { name: 'Youth Mobility', descKey: 'dashboard.personalized.widgets.jobOpportunities.programs.youthMobilityUK', url: 'https://www.gov.uk/youth-mobility', icon: 'users' },
  ],
  US: [
    { name: 'H-1B Visa', descKey: 'dashboard.personalized.widgets.jobOpportunities.programs.h1b', url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations', icon: 'globe' },
    { name: 'J-1 Exchange', descKey: 'dashboard.personalized.widgets.jobOpportunities.programs.j1', url: 'https://j1visa.state.gov', icon: 'graduation' },
  ],
  CH: [
    { name: 'Permis L/B', descKey: 'dashboard.personalized.widgets.jobOpportunities.programs.permisSwiss', url: 'https://www.sem.admin.ch/sem/fr/home.html', icon: 'globe' },
  ],
}

function getProgramIcon(icon: string) {
  switch (icon) {
    case 'graduation': return GraduationCap
    case 'users': return Users
    default: return Globe
  }
}

export default function JobOpportunitiesWidget({
  countryData,
  userProfile,
  onEdit,
  onHide,
  onResize,
  currentSize,
}: JobOpportunitiesWidgetProps) {
  const { t } = useTranslation()
  const jobMarket = countryData?.jobMarket
  const countryCode = countryData?.code || ''
  const programs = COUNTRY_PROGRAMS[countryCode] || []
  const currency = countryData?.currency || 'EUR'
  const adzunaCode = ISO_TO_ADZUNA[countryCode]

  // Fetch REAL job data from Adzuna API via backend
  const { data: adzunaData, isLoading: adzunaLoading } = useQuery<AdzunaSearchResponse>({
    queryKey: ['dashboard-jobs', adzunaCode],
    queryFn: () => searchJobs({ country: adzunaCode, resultsPerPage: 5, page: 1 }),
    enabled: !!adzunaCode,
    staleTime: 15 * 60 * 1000, // 15 min cache
    retry: 1,
  })

  const totalJobsCount = adzunaData?.total || 0
  const recentJobs = adzunaData?.results?.slice(0, 3) || []

  // Get profile-based info
  const age = userProfile?.age || 25
  const status = userProfile?.status || ''
  const statusLabel = status ? t(`onboarding.constants.status.${status}`, status) : ''

  // Determine top 3 relevant sectors based on user profile
  const getRelevantSectors = () => {
    if (!jobMarket?.topSectors) return []
    const sectors = [...jobMarket.topSectors]
    // Prioritize based on objective
    if (userProfile?.mainObjective === 'study') {
      const teaching = sectors.find(s => s.toLowerCase().includes('enseign') || s.toLowerCase().includes('teach') || s.toLowerCase().includes('education'))
      if (teaching) {
        sectors.splice(sectors.indexOf(teaching), 1)
        sectors.unshift(teaching)
      }
    }
    return sectors.slice(0, 3)
  }

  const relevantSectors = getRelevantSectors()
  const topSectorSalaries = jobMarket?.salaryBySector
    ? Object.entries(jobMarket.salaryBySector).sort(([, a], [, b]) => b - a).slice(0, 3)
    : []

  return (
    <Widget
      title={t('dashboard.personalized.widgets.jobOpportunities.title', { country: countryData?.name || '' })}
      icon={Briefcase}
      iconColor="text-indigo-600"
      onEdit={onEdit}
      onHide={onHide}
      onResize={onResize}
      currentSize={currentSize}
    >
      <div className="space-y-5">
        {/* User profile badge + live job count */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-indigo-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <p className="text-sm text-indigo-800">
              {t('dashboard.personalized.widgets.jobOpportunities.profile', { age, status: statusLabel })}
            </p>
          </div>
          {totalJobsCount > 0 && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full whitespace-nowrap">
              {totalJobsCount.toLocaleString()} {t('dashboard.personalized.widgets.jobOpportunities.offersAvailable')}
            </span>
          )}
        </div>

        {/* Relevant sectors */}
        {relevantSectors.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t('dashboard.personalized.widgets.jobOpportunities.sectors')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {relevantSectors.map((sector, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm"
                >
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  {sector}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Salary info */}
        {jobMarket?.averageSalary && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">{t('dashboard.personalized.widgets.jobOpportunities.avgSalary')}</p>
            <p className="text-xl font-bold text-gray-900">
              {jobMarket.averageSalary.toLocaleString()} <span className="text-sm font-medium text-gray-500">{currency}/{t('dashboard.personalized.widgets.jobOpportunities.month')}</span>
            </p>
            {topSectorSalaries.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {topSectorSalaries.map(([sector, salary]) => (
                  <div key={sector} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{sector}</span>
                    <span className="font-medium text-gray-900">{salary.toLocaleString()} {currency}</span>
                  </div>
                ))}
              </div>
            )}
            {jobMarket.unemploymentRate && (
              <p className="mt-2 text-xs text-gray-500">
                {t('dashboard.personalized.widgets.jobOpportunities.unemployment', { rate: jobMarket.unemploymentRate })}
              </p>
            )}
          </div>
        )}

        {/* Programs */}
        {programs.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t('dashboard.personalized.widgets.jobOpportunities.programsTitle')}
            </h4>
            <div className="space-y-2">
              {programs.map((program, idx) => {
                const IconComp = getProgramIcon(program.icon)
                return (
                  <a
                    key={idx}
                    href={program.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                  >
                    <div className="p-1.5 bg-indigo-100 rounded-md group-hover:bg-indigo-200 transition-colors">
                      <IconComp className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{program.name}</p>
                      <p className="text-xs text-gray-500 truncate">{t(program.descKey)}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent live job offers from Adzuna */}
        {recentJobs.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t('dashboard.personalized.widgets.jobOpportunities.recentOffers')}
            </h4>
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <a
                  key={job.id}
                  href={job.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 line-clamp-1 group-hover:text-indigo-700">
                      {job.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{job.company}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location?.displayName || job.location?.city || '—'}
                      </span>
                      {job.salary?.min && (
                        <span className="text-xs text-green-600 font-medium">
                          {job.salary.min.toLocaleString()}{job.salary.max ? `–${job.salary.max.toLocaleString()}` : ''} {job.salary.currency || currency}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
            {adzunaLoading && (
              <div className="flex justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
              </div>
            )}
          </div>
        )}

        {/* Job sites */}
        {jobMarket?.keyJobSites && jobMarket.keyJobSites.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t('dashboard.personalized.widgets.jobOpportunities.jobSites')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {jobMarket.keyJobSites.slice(0, 4).map((site, idx) => (
                <a
                  key={idx}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-indigo-100 rounded-lg text-xs font-medium text-gray-700 hover:text-indigo-700 transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  {site.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!jobMarket && (
          <div className="text-center text-gray-500 py-6">
            <Briefcase className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">{t('dashboard.personalized.widgets.jobOpportunities.noData')}</p>
          </div>
        )}
      </div>
    </Widget>
  )
}
