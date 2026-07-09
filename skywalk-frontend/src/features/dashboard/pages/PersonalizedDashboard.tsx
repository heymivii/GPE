import { useState, useEffect } from 'react'
import { Plus, LayoutGrid, X, Check, User, CheckSquare, Wallet, Lightbulb, GripVertical } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useProjects } from '../../projects/hooks/useProjectMutations'
import { useCountryData } from '../../../hooks/useCountryData'
import { useAuth } from '../../../hooks/useAuth'
import { useActiveProject } from '../../../contexts/ActiveProjectContext'
import { useDashboardPreferences } from '../hooks/useDashboardPreferences'
import ProfileSummaryWidget from '../widgets/ProfileSummaryWidget'
import RecommendationsWidget from '../widgets/RecommendationsWidget'
import ChecklistWidget from '../widgets/ChecklistWidget'
import BudgetTrackerWidget from '../widgets/BudgetTrackerWidget'
import LocalTimeWidget from '../widgets/LocalTimeWidget'
import WeatherWidget from '../widgets/WeatherWidget'
import CurrencyConverterWidget from '../widgets/CurrencyConverterWidget'
import JobOpportunitiesWidget from '../widgets/JobOpportunitiesWidget'
import { useTranslation } from 'react-i18next'
import { getLocale } from '../../../data/supportedCountries'

export default function PersonalizedDashboard() {
  const { t, i18n } = useTranslation()
  const { data: projects, isLoading } = useProjects()
  const { user } = useAuth()
  const { hiddenWidgets, toggleWidget, widgetOrder, updateWidgetOrder, getWidgetSize, setWidgetSize } = useDashboardPreferences()
  const [searchParams] = useSearchParams()
  const { activeProjectId, setActiveProjectId } = useActiveProject()
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(() => {
    const projectParam = searchParams.get('project')
    // URL param wins (deep links), else the site-wide active project.
    return projectParam ? Number(projectParam) : activeProjectId
  })
  const [editMode, setEditMode] = useState(false)
  const [showAddWidget, setShowAddWidget] = useState(false)

  const defaultLayout = [
    'checklist',
    'profile-summary',
    'job-opportunities',
    'local-time',
    'weather',
    'recommendations',
    'budget-tracker',
    'currency-converter',
  ]

  const [dashboardLayout, setDashboardLayout] = useState<string[]>(
    widgetOrder || defaultLayout
  )

  useEffect(() => {
    if (widgetOrder) {
      setDashboardLayout(widgetOrder)
    }
  }, [widgetOrder])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (projects && projects.length > 0) {
      if (selectedProjectId === null) {
        const mostRecentProject = projects[projects.length - 1]
        setSelectedProjectId(mostRecentProject.idProject)
      } else {
        const exists = projects.some(p => p.idProject === selectedProjectId)
        if (!exists) {
          setSelectedProjectId(projects[projects.length - 1].idProject)
        }
      }
    }
  }, [projects, selectedProjectId])

  // Follow the URL ?project param — the NavBar switcher navigates to
  // /dashboard?project=id, and when the dashboard is already mounted the
  // useState initializer above won't rerun, so without this the selection
  // would silently do nothing.
  useEffect(() => {
    const projectParam = searchParams.get('project')
    if (projectParam) {
      const id = Number(projectParam)
      if (!Number.isNaN(id) && id !== selectedProjectId) {
        setSelectedProjectId(id)
      }
    }
  }, [searchParams, selectedProjectId])

  // Keep the site-wide active project in sync with what the dashboard shows.
  useEffect(() => {
    if (selectedProjectId != null && selectedProjectId !== activeProjectId) {
      setActiveProjectId(selectedProjectId)
    }
  }, [selectedProjectId, activeProjectId, setActiveProjectId])

  const availableWidgets = [
    { id: 'profile-summary', name: t('dashboard.personalized.widgets.available.profileSummary.name'), icon: '👤', description: t('dashboard.personalized.widgets.available.profileSummary.description') },
    { id: 'local-time', name: t('dashboard.personalized.widgets.available.localTime.name'), icon: '⏰', description: t('dashboard.personalized.widgets.available.localTime.description') },
    { id: 'weather', name: t('dashboard.personalized.widgets.available.weather.name'), icon: '🌤️', description: t('dashboard.personalized.widgets.available.weather.description') },
    { id: 'checklist', name: t('dashboard.personalized.widgets.available.checklist.name'), icon: '✅', description: t('dashboard.personalized.widgets.available.checklist.description') },
    { id: 'budget-tracker', name: t('dashboard.personalized.widgets.available.budgetTracker.name'), icon: '💰', description: t('dashboard.personalized.widgets.available.budgetTracker.description') },
    { id: 'recommendations', name: t('dashboard.personalized.widgets.available.recommendations.name'), icon: '💡', description: t('dashboard.personalized.widgets.available.recommendations.description') },
    { id: 'currency-converter', name: t('dashboard.personalized.widgets.available.currencyConverter.name'), icon: '💱', description: t('dashboard.personalized.widgets.available.currencyConverter.description') },
    { id: 'job-opportunities', name: t('dashboard.personalized.widgets.available.jobOpportunities.name'), icon: '💼', description: t('dashboard.personalized.widgets.available.jobOpportunities.description') },
  ]

  const activeProject = projects?.find(p => p.idProject === selectedProjectId)

  const countryData = useCountryData(activeProject?.idDestinationCountry)
  const originCountryData = useCountryData(activeProject?.idOriginCountry)

  const getWidgetColSpan = (widgetId: string) => {
    const size = getWidgetSize(widgetId)
    switch (size) {
      case 'small': return 'lg:col-span-1'
      case 'medium': return 'lg:col-span-1'
      case 'large': return 'lg:col-span-2'
      default: return 'lg:col-span-1'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('dashboard.personalized.loading')}</p>
        </div>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('dashboard.personalized.noProjects.title')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('dashboard.personalized.noProjects.description')}
          </p>
          <Link
            to="/onboarding"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {t('dashboard.personalized.noProjects.cta')}
          </Link>
        </div>
      </div>
    )
  }

  const objectiveReverseMap: Record<string, string> = {
    'study': 'studies',
    'work': 'work',
    'adventure': 'discovery',
    'family_reunion': 'family',
    'retirement': 'other',
    'other': 'other'
  }

  const userData = {
    name: user?.fullName || t('dashboard.personalized.defaultUser'),
    onboardingData: {
      destination: {
        fromCountry: originCountryData?.code || 'FR',
        toCountry: countryData?.code || 'XX',
        targetCity: activeProject?.destinationCity?.name || '',
        departureYear: activeProject?.expectedDepartureDate
          ? new Date(activeProject.expectedDepartureDate).getFullYear().toString()
          : new Date().getFullYear().toString()
      },
      profile: {
        age: user?.age?.toString() || '',
        status: user?.status || '',
        travelParty: activeProject?.travelType || 'alone'
      },
      objective: {
        goal: objectiveReverseMap[activeProject?.mainObjective || 'work'] || 'other'
      }
    }
  }

  const toggleWidgetVisibility = (widgetId: string) => {
    toggleWidget(widgetId)
  }

  const visibleWidgets = dashboardLayout.filter(
    widgetId => !hiddenWidgets.includes(widgetId)
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setDashboardLayout((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        const newOrder = arrayMove(items, oldIndex, newIndex)
        updateWidgetOrder(newOrder)
        return newOrder
      })
    }
  }

  const SortableWidget = ({ id, children, className: extraClass = '' }: { id: string; children: React.ReactNode; className?: string }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.7 : 1,
      zIndex: isDragging ? 50 : 1,
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`relative h-full ${extraClass} ${editMode ? 'transition-all duration-300' : ''}`}
      >
        {editMode && (
          <div
            {...attributes}
            {...listeners}
            className="absolute top-0 inset-x-0 h-10 sm:h-auto sm:w-10 sm:inset-auto sm:-left-3 sm:top-1/2 sm:-translate-y-1/2 z-20 cursor-grab active:cursor-grabbing bg-purple-100 sm:bg-purple-600 rounded-t-xl sm:rounded-lg flex sm:flex-col items-center justify-center p-0 sm:py-3 border-x border-t border-purple-200 sm:border-0 shadow-sm sm:shadow-lg hover:bg-purple-200 sm:hover:bg-purple-700 transition-colors touch-none"
            title={t('dashboard.dragToReorder')}
          >
            <GripVertical className="w-5 h-5 sm:w-4 sm:h-4 text-purple-600 sm:text-white" />
          </div>
        )}
        <div className={`h-full ${editMode ? 'pt-10 sm:pt-0 sm:pl-4 transition-all duration-300' : 'transition-all duration-300'}`}>
          <div className={`h-full ${editMode ? 'ring-2 ring-purple-300 rounded-b-xl sm:rounded-xl overflow-hidden ring-offset-1' : ''}`}>
            {children}
          </div>
          {editMode && <div className="absolute inset-0 top-10 sm:top-0 sm:left-4 z-10 bg-transparent pointer-events-none rounded-b-xl sm:rounded-xl" />}
        </div>
      </div>
    )
  }

  const renderWidget = (widgetId: string) => {
    const commonProps = {
      onHide: () => toggleWidgetVisibility(widgetId),
      onResize: (size: 'small' | 'medium' | 'large') => setWidgetSize(widgetId, size),
      currentSize: getWidgetSize(widgetId),
    }

    switch (widgetId) {
      case 'profile-summary':
        return (
          <ProfileSummaryWidget
            key={widgetId}
            userData={userData}
            {...commonProps}
          />
        )

      case 'local-time':
        return (
          <LocalTimeWidget
            key={widgetId}
            countryCode={countryData?.code || 'FR'}
            countryName={countryData?.name || 'France'}
            timezone={(activeProject?.destinationCity as { timezone?: string } | undefined)?.timezone || undefined}
            {...commonProps}
          />
        )

      case 'weather':
        return (
          <WeatherWidget
            key={widgetId}
            countryName={countryData?.name || 'France'}
            cityName={activeProject?.destinationCity?.name || countryData?.capital || ''}
            {...commonProps}
          />
        )

      case 'recommendations':
        return (
          <RecommendationsWidget
            key={widgetId}
            countryId={activeProject?.idDestinationCountry}
            countryIsoCode={countryData?.code}
            activeProject={activeProject}
            {...commonProps}
          />
        )

      case 'checklist':
        return (
          <ChecklistWidget
            key={widgetId}
            countryData={countryData || null}
            projectId={activeProject?.idProject || 0}
            project={{
              travelType: activeProject?.travelType,
              objective: activeProject?.mainObjective,
              expectedDepartureDate: activeProject?.expectedDepartureDate,
              idProject: activeProject?.idProject,
              nationality: activeProject?.nationality,
              hasChildren: activeProject?.hasChildren,
              priorities: activeProject?.priorities,
              isPaid: activeProject?.isPaid,
            }}
            {...commonProps}
          />
        )

      case 'budget-tracker':
        return (
          <BudgetTrackerWidget
            key={widgetId}
            housingBudget={activeProject?.housingBudget?.toString() || '0'}
            countryData={countryData}
            originCountryData={originCountryData}
            cityName={activeProject?.destinationCity?.name || undefined}
            {...commonProps}
          />
        )

      case 'currency-converter':
        return (
          <CurrencyConverterWidget
            key={widgetId}
            {...commonProps}
          />
        )

      case 'job-opportunities':
        return (
          <JobOpportunitiesWidget
            key={widgetId}
            countryData={countryData}
            hasJobOffer={activeProject?.hasJobOffer}
            projectId={activeProject?.idProject}
            userProfile={{
              age: user?.age || undefined,
              status: user?.status || undefined,
              mainObjective: activeProject?.mainObjective || undefined,
              languages: user?.spokenLanguages || undefined,
            }}
            {...commonProps}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('dashboard.personalized.greeting')}
              </h1>
              <p className="text-sm text-gray-600">
                {t('dashboard.personalized.projectTo', { country: countryData?.name || t('common.destination') })}
              </p>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              {/* Project selection now lives site-wide in the NavBar (ProjectSwitcher) — no duplicate here. */}
              {selectedProjectId && (
                <Link
                  to={`/onboarding/${selectedProjectId}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all text-sm"
                  title={t('dashboard.personalized.editProject')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">{t('dashboard.personalized.editProject')}</span>
                </Link>
              )}
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all text-sm ${editMode
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
              >
                {editMode ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t('dashboard.personalized.finish')}</span>
                  </>
                ) : (
                  <>
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('dashboard.personalized.modifyWidgets')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">{t('dashboard.personalized.stats.projectStatus.label')}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {activeProject?.projectStatus === 'planning' && t('dashboard.personalized.stats.projectStatus.planning')}
                  {activeProject?.projectStatus === 'active' && t('dashboard.personalized.stats.projectStatus.active')}
                  {activeProject?.projectStatus === 'completed' && t('dashboard.personalized.stats.projectStatus.completed')}
                </p>
                {activeProject?.projectStatus === 'planning' && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full shrink-0">
                    {t('dashboard.personalized.stats.projectStatus.ongoing')}
                  </span>
                )}
                {activeProject?.projectStatus === 'active' && (
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full shrink-0">
                    {t('dashboard.personalized.stats.projectStatus.active')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">{t('dashboard.personalized.stats.departureDate.label')}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {activeProject?.expectedDepartureDate
                    ? new Date(activeProject.expectedDepartureDate).toLocaleDateString(getLocale(i18n.language), { day: 'numeric', month: 'short', year: 'numeric' })
                    : t('dashboard.personalized.stats.departureDate.undefined')}
                </p>
                {activeProject?.expectedDepartureDate && (
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                    {t('dashboard.personalized.stats.departureDate.days', {
                      count: Math.max(0, Math.ceil((new Date(activeProject.expectedDepartureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg shrink-0">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">{t('dashboard.personalized.stats.housingBudget.label')}</p>
              <p className="text-sm font-bold text-gray-900 truncate">
                {activeProject?.housingBudget
                  ? `${Number(activeProject.housingBudget).toLocaleString()} ${originCountryData?.currency || 'EUR'}`
                  : t('dashboard.personalized.stats.housingBudget.undefined')}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg shrink-0">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">{t('dashboard.personalized.stats.duration.label')}</p>
              <p className="text-sm font-bold text-gray-900 truncate">
                {activeProject?.expectedDuration
                  ? (() => {
                    const months = activeProject.expectedDuration
                    if (months <= 6) return t('dashboard.personalized.stats.duration.less6months')
                    if (months <= 12) return t('dashboard.personalized.stats.duration.6to12months')
                    if (months <= 36) return t('dashboard.personalized.stats.duration.1to3years')
                    return t('dashboard.personalized.stats.duration.more3years')
                  })()
                  : t('dashboard.personalized.stats.duration.undefined')}
              </p>
            </div>
          </div>
        </div>

        {editMode && (
          <div className="mb-5 bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center space-x-3">
            <GripVertical className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-purple-900">
                {t('dashboard.personalized.editModeActive')}
              </p>
              <p className="text-sm text-purple-700 mt-1">
                {t('dashboard.personalized.editModeDescription')}
              </p>
            </div>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleWidgets}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              {visibleWidgets.map((widgetId) => (
                <SortableWidget key={widgetId} id={widgetId} className={getWidgetColSpan(widgetId)}>
                  {renderWidget(widgetId)}
                </SortableWidget>
              ))}

              {editMode && (
                <button
                  onClick={() => setShowAddWidget(true)}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/50 cursor-pointer transition-all min-h-[160px]"
                >
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">{t('dashboard.personalized.widgets.addWidget')}</span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>

        {hiddenWidgets.length > 0 && editMode && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.personalized.widgets.hiddenWidgets')}</h3>
            <div className="flex flex-wrap gap-2">
              {hiddenWidgets.map((widgetId) => (
                <button
                  key={widgetId}
                  onClick={() => toggleWidgetVisibility(widgetId)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  {t('dashboard.personalized.widgets.restore', { name: widgetId.replace('-', ' ') })}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {showAddWidget && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.personalized.widgets.library.title')}</h2>
                <p className="text-gray-500 mt-1">
                  {t('dashboard.personalized.widgets.library.description')}
                </p>
              </div>
              <button
                onClick={() => setShowAddWidget(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableWidgets.map((widget) => {
                  const isInLayout = dashboardLayout.includes(widget.id)
                  const isHidden = hiddenWidgets.includes(widget.id)
                  const isAdded = isInLayout && !isHidden

                  const Icon = {
                    'profile-summary': User,
                    'checklist': CheckSquare,
                    'budget-tracker': Wallet,
                    'recommendations': Lightbulb,
                  }[widget.id] || LayoutGrid

                  return (
                    <button
                      key={widget.id}
                      onClick={() => {
                        if (isAdded) return
                        if (isHidden) {
                          toggleWidgetVisibility(widget.id)
                        } else if (!isInLayout) {
                          const newLayout = [...dashboardLayout, widget.id]
                          setDashboardLayout(newLayout)
                          updateWidgetOrder(newLayout)
                        }
                      }}
                      disabled={isAdded}
                      className={`group relative flex items-start p-5 rounded-xl border-2 text-left transition-all duration-200 ${isAdded
                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-default'
                        : 'border-white bg-white shadow-sm hover:border-blue-500 cursor-pointer'
                        }`}
                    >
                      <div className={`p-3 rounded-lg mr-4 ${isAdded ? 'bg-gray-200 text-gray-500' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                        }`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold ${isAdded ? 'text-gray-500' : 'text-gray-900'}`}>
                            {widget.name}
                          </h3>
                          {isAdded && (
                            <span className="flex items-center text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              <Check className="w-3 h-3 mr-1" />
                              {t('dashboard.personalized.widgets.library.added')}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed ${isAdded ? 'text-gray-400' : 'text-gray-500'}`}>
                          {widget.description}
                        </p>

                        {!isAdded && (
                          <div className="mt-4 flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <Plus className="w-4 h-4 mr-1" />
                            {t('dashboard.personalized.widgets.library.addToDashboard')}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowAddWidget(false)}
                className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
              >
                {t('dashboard.personalized.widgets.library.done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}