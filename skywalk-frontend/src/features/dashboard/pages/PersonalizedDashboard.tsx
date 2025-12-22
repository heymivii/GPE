import { useState, useEffect } from 'react'
import { Settings, Plus, LayoutGrid, X, Check, User, CheckSquare, Wallet, Lightbulb, GripVertical } from 'lucide-react'
import { Link } from 'react-router-dom'
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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useProjects } from '../../projects/hooks/useProjectMutations'
import { useCountryData } from '../../../hooks/useCountryData'
import { useAuth } from '../../../hooks/useAuth'
import { useDashboardPreferences } from '../hooks/useDashboardPreferences'
import ProfileSummaryWidget from '../widgets/ProfileSummaryWidget'
import RecommendationsWidget from '../widgets/RecommendationsWidget'
import ChecklistWidget from '../widgets/ChecklistWidget'
import BudgetTrackerWidget from '../widgets/BudgetTrackerWidget'
import LocalTimeWidget from '../widgets/LocalTimeWidget'
import WeatherWidget from '../widgets/WeatherWidget'
import CurrencyConverterWidget from '../widgets/CurrencyConverterWidget'
import { useTranslation } from 'react-i18next'

export default function PersonalizedDashboard() {
  const { t } = useTranslation()
  const { data: projects, isLoading } = useProjects()
  const { user } = useAuth()
  const { hiddenWidgets, toggleWidget, widgetOrder, updateWidgetOrder } = useDashboardPreferences()
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [showAddWidget, setShowAddWidget] = useState(false)
  
  const defaultLayout = [
    'profile-summary',
    'local-time',
    'weather',
    'checklist', 
    'budget-tracker',
    'recommendations',
    'currency-converter'
  ]
  
  const [dashboardLayout, setDashboardLayout] = useState<string[]>(
    widgetOrder || defaultLayout
  )
  
  // Sync with preferences
  useEffect(() => {
    if (widgetOrder) {
      setDashboardLayout(widgetOrder)
    }
  }, [widgetOrder])
  
  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 🔄 Initialiser avec le dernier projet créé (le plus récent)
  useEffect(() => {
    if (projects && projects.length > 0 && selectedProjectId === null) {
      const mostRecentProject = projects[projects.length - 1]
      console.log('🎯 Auto-selecting most recent project:', mostRecentProject)
      setSelectedProjectId(mostRecentProject.idProject)
    }
  }, [projects, selectedProjectId])

  const availableWidgets = [
    { id: 'profile-summary', name: t('dashboard.personalized.widgets.available.profileSummary.name'), icon: '👤', description: t('dashboard.personalized.widgets.available.profileSummary.description') },
    { id: 'local-time', name: t('dashboard.personalized.widgets.available.localTime.name'), icon: '⏰', description: t('dashboard.personalized.widgets.available.localTime.description') },
    { id: 'weather', name: t('dashboard.personalized.widgets.available.weather.name'), icon: '🌤️', description: t('dashboard.personalized.widgets.available.weather.description') },
    { id: 'checklist', name: t('dashboard.personalized.widgets.available.checklist.name'), icon: '✅', description: t('dashboard.personalized.widgets.available.checklist.description') },
    { id: 'budget-tracker', name: t('dashboard.personalized.widgets.available.budgetTracker.name'), icon: '💰', description: t('dashboard.personalized.widgets.available.budgetTracker.description') },
    { id: 'recommendations', name: t('dashboard.personalized.widgets.available.recommendations.name'), icon: '💡', description: t('dashboard.personalized.widgets.available.recommendations.description') },
    { id: 'currency-converter', name: t('dashboard.personalized.widgets.available.currencyConverter.name'), icon: '💱', description: t('dashboard.personalized.widgets.available.currencyConverter.description') },
  ]

  // ✅ Ne pas utiliser de fallback, attendre que selectedProjectId soit initialisé
  const activeProject = projects?.find(p => p.idProject === selectedProjectId)
  
  // 🔍 Debug: Afficher le projet actif
  useEffect(() => {
    if (activeProject) {
      console.log('📊 Active project:', activeProject)
      console.log('   - ID:', activeProject.idProject)
      console.log('   - Destination Country ID:', activeProject.idDestinationCountry)
      console.log('   - Budget:', activeProject.housingBudget)
    }
  }, [activeProject])
  
  const countryData = useCountryData(activeProject?.idDestinationCountry)
  const originCountryData = useCountryData(activeProject?.idOriginCountry)
  
  // 🔍 Debug: Afficher countryData reçu
  useEffect(() => {
    console.log('🌍 countryData received:', countryData)
    console.log('   - Country ID asked:', activeProject?.idDestinationCountry)
  }, [countryData, activeProject?.idDestinationCountry])

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

  const userData = {
    name: user?.fullName || 'Utilisateur', 
    onboardingData: {
      destination: {
        fromCountry: 'FR',
        toCountry: countryData?.code || 'XX',
        targetCity: '',
        departureYear: activeProject?.expectedDepartureDate 
          ? new Date(activeProject.expectedDepartureDate).getFullYear().toString()
          : new Date().getFullYear().toString()
      },
      profile: {
        age: user?.age?.toString() || '25',
        status: activeProject?.travelType || 'alone',
        travelParty: activeProject?.travelType || 'alone'
      },
      objective: {
        goal: activeProject?.mainObjective || 'work'
      }
    }
  }

  const toggleWidgetVisibility = (widgetId: string) => {
    toggleWidget(widgetId)
  }

  const visibleWidgets = dashboardLayout.filter(
    widgetId => !hiddenWidgets.includes(widgetId)
  )
  
  // Handler for drag end
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
  
  // Sortable Widget Wrapper
  const SortableWidget = ({ id, children }: { id: string; children: React.ReactNode }) => {
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
      opacity: isDragging ? 0.5 : 1,
      cursor: editMode ? 'grab' : 'default',
    }
    
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className={`relative h-full ${editMode ? 'hover:ring-2 hover:ring-purple-300 rounded-xl transition-all' : ''}`}
      >
        {editMode && (
          <div
            {...attributes}
            {...listeners}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing bg-purple-500 rounded-lg p-2 shadow-lg hover:shadow-xl hover:bg-purple-600 transition-all"
            title="Glisser pour réorganiser"
          >
            <GripVertical className="w-4 h-4 text-white" />
          </div>
        )}
        <div className={`h-full ${editMode ? 'pl-4' : ''}`}>
          {children}
        </div>
      </div>
    )
  }

  const renderWidget = (widgetId: string) => {
    const commonProps = {
      onEdit: () => console.log(`Edit ${widgetId}`),
      onHide: () => toggleWidgetVisibility(widgetId)
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
            onHide={() => toggleWidgetVisibility(widgetId)}
          />
        )
      
      case 'weather':
        return (
          <WeatherWidget
            key={widgetId}
            countryName={countryData?.name || 'France'}
            cityName={countryData?.capital || ''}
            onHide={() => toggleWidgetVisibility(widgetId)}
          />
        )
      
      case 'recommendations':
        return (
          <RecommendationsWidget
            key={widgetId}
            countryId={activeProject?.idDestinationCountry}
            {...commonProps}
          />
        )
      
      case 'checklist':
        return (
          <ChecklistWidget
            key={widgetId}
            countryData={countryData || null}
            projectId={activeProject?.idProject || 0}
            {...commonProps}
          />
        )
      
      case 'budget-tracker':
        return (
          <BudgetTrackerWidget
            key={widgetId}
            housingBudget={activeProject?.housingBudget?.toString() || '0'}
            countryData={countryData}
            {...commonProps}
          />
        )
      
      case 'currency-converter':
        return (
          <CurrencyConverterWidget
            key={widgetId}
            onHide={() => toggleWidgetVisibility(widgetId)}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('dashboard.personalized.greeting')}
              </h1>
              <p className="text-sm text-gray-600">
                {t('dashboard.personalized.projectTo', { country: countryData?.name || 'Destination' })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {projects.length >= 1 && selectedProjectId && (
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium hover:border-gray-400 transition-colors"
                >
                  {projects.map((project) => {
                    // Trouver le nom du pays
                    const countryNames: Record<number, string> = {
                      1: 'France', 2: 'Canada', 3: 'Suisse', 4: 'Allemagne', 
                      5: 'Espagne', 6: 'Italie', 7: 'Portugal', 8: 'Belgique',
                      9: 'Pays-Bas', 10: 'Luxembourg', 11: 'Royaume-Uni', 
                      12: 'Irlande', 13: 'États-Unis', 14: 'Australie', 16: 'Japon'
                    }
                    const countryName = countryNames[project.idDestinationCountry] || 'Destination'
                    return (
                      <option key={project.idProject} value={project.idProject}>
                        {countryName}
                      </option>
                    )
                  })}
                </select>
              )}
              {selectedProjectId && (
                <Link
                  to={`/onboarding/${selectedProjectId}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                  title={t('dashboard.personalized.editProject')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-sm">{t('dashboard.personalized.editProject')}</span>
                </Link>
              )}
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  editMode 
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {editMode ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-sm">{t('dashboard.personalized.finish')}</span>
                  </>
                ) : (
                  <>
                    <LayoutGrid className="w-4 h-4" />
                    <span className="text-sm">{t('dashboard.personalized.modifyWidgets')}</span>
                  </>
                )}
              </button>
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                title={t('dashboard.personalized.settings')}
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              {activeProject?.projectStatus === 'planning' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {t('dashboard.personalized.stats.projectStatus.ongoing')}
                </span>
              )}
              {activeProject?.projectStatus === 'active' && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  {t('dashboard.personalized.stats.projectStatus.active')}
                </span>
              )}
              {activeProject?.projectStatus === 'completed' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  {t('dashboard.personalized.stats.projectStatus.completed')}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('dashboard.personalized.stats.projectStatus.label')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeProject?.projectStatus === 'planning' && t('dashboard.personalized.stats.projectStatus.planning')}
                {activeProject?.projectStatus === 'active' && t('dashboard.personalized.stats.projectStatus.active')}
                {activeProject?.projectStatus === 'completed' && t('dashboard.personalized.stats.projectStatus.completed')}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {activeProject?.expectedDepartureDate && (
                <span className="text-xs text-gray-400 font-medium">
                  {t('dashboard.personalized.stats.departureDate.days', { 
                    count: Math.ceil((new Date(activeProject.expectedDepartureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  })}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('dashboard.personalized.stats.departureDate.label')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeProject?.expectedDepartureDate
                  ? new Date(activeProject.expectedDepartureDate).toLocaleDateString('fr-FR', { 
                      day: 'numeric',
                      month: 'short', 
                      year: 'numeric' 
                    })
                  : t('dashboard.personalized.stats.departureDate.undefined')}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 font-medium">{t('dashboard.personalized.stats.housingBudget.perMonth')}</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('dashboard.personalized.stats.housingBudget.label')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeProject?.housingBudget
                  ? `${activeProject.housingBudget} ${originCountryData?.currency || '€'}`
                  : t('dashboard.personalized.stats.housingBudget.undefined')}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 font-medium">{t('dashboard.personalized.stats.duration.estimated')}</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('dashboard.personalized.stats.duration.label')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeProject?.expectedDuration 
                  ? t('dashboard.personalized.stats.duration.months', { count: activeProject.expectedDuration })
                  : t('dashboard.personalized.stats.duration.undefined')}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Mode Notification */}
        {editMode && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start space-x-3">
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
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleWidgets.map((widgetId) => (
                <SortableWidget key={widgetId} id={widgetId}>
                  {renderWidget(widgetId)}
                </SortableWidget>
              ))}
              
              {editMode && (
                <button
                  onClick={() => setShowAddWidget(true)}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
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
                  const isVisible = visibleWidgets.includes(widget.id)
                  const isHidden = hiddenWidgets.includes(widget.id)
                  const isAdded = isVisible && !isHidden

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
                        if (isHidden) {
                          toggleWidgetVisibility(widget.id)
                        }
                      }}
                      disabled={isAdded}
                      className={`group relative flex items-start p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                        isAdded
                          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-default'
                          : 'border-white bg-white shadow-sm hover:border-blue-500 cursor-pointer'
                      }`}
                    >
                      <div className={`p-3 rounded-lg mr-4 ${
                        isAdded ? 'bg-gray-200 text-gray-500' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
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