import { useState } from 'react'
import { Settings, Plus, LayoutGrid, X, Check, User, CheckSquare, Wallet, Lightbulb } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProjects } from '../../projects/hooks/useProjectMutations'
import { useCountryData } from '../../../hooks/useCountryData'
import ProfileSummaryWidget from '../widgets/ProfileSummaryWidget'
import RecommendationsWidget from '../widgets/RecommendationsWidget'
import ChecklistWidget from '../widgets/ChecklistWidget'
import BudgetTrackerWidget from '../widgets/BudgetTrackerWidget'

export default function PersonalizedDashboard() {
  const { data: projects, isLoading } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([])
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [dashboardLayout] = useState<string[]>([
    'profile-summary',
    'checklist', 
    'budget-tracker',
    'recommendations'
  ])

  const availableWidgets = [
    { id: 'profile-summary', name: 'Résumé du profil', icon: '👤', description: 'Vos informations personnelles' },
    { id: 'checklist', name: 'Checklist', icon: '✅', description: 'Vos étapes d\'expatriation' },
    { id: 'budget-tracker', name: 'Budget', icon: '💰', description: 'Suivi de votre budget' },
    { id: 'recommendations', name: 'Recommandations', icon: '💡', description: 'Conseils personnalisés' },
  ]

  const activeProject = projects?.find(p => p.idProject === selectedProjectId) || projects?.[0]
  const countryData = useCountryData(activeProject?.idDestinationCountry)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre dashboard personnalisé...</p>
        </div>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Dashboard en cours de préparation
          </h2>
          <p className="text-gray-600 mb-6">
            Complétez votre onboarding pour accéder à votre dashboard personnalisé
          </p>
          <Link
            to="/onboarding"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Compléter mon profil
          </Link>
        </div>
      </div>
    )
  }

  const userData = {
    name: 'Utilisateur', 
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
        age: '30',
        status: activeProject?.travelType || 'alone',
        travelParty: activeProject?.travelType || 'alone'
      },
      objective: {
        goal: activeProject?.mainObjective || 'work'
      }
    }
  }

  const toggleWidgetVisibility = (widgetId: string) => {
    setHiddenWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    )
  }

  const visibleWidgets = dashboardLayout.filter(
    widgetId => !hiddenWidgets.includes(widgetId)
  )

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
                Bonjour ! 👋
              </h1>
              <p className="text-sm text-gray-600">
                Votre projet d'expatriation vers {countryData?.name || 'Destination'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {projects.length > 1 && (
                <select
                  value={selectedProjectId || activeProject?.idProject || ''}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                >
                  {projects.map((project) => (
                    <option key={project.idProject} value={project.idProject}>
                      Projet #{project.idProject}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  editMode 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-sm">Personnaliser</span>
              </button>
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Paramètres</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {editMode && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Mode édition activé</strong> - Cliquez sur le menu (⋯) de chaque widget pour le modifier ou le masquer
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              {activeProject?.projectStatus === 'planning' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  En cours
                </span>
              )}
              {activeProject?.projectStatus === 'active' && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Actif
                </span>
              )}
              {activeProject?.projectStatus === 'completed' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  Terminé
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Statut du projet</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeProject?.projectStatus === 'planning' && 'Planification'}
                {activeProject?.projectStatus === 'active' && 'Actif'}
                {activeProject?.projectStatus === 'completed' && 'Complété'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {activeProject?.expectedDepartureDate && (
                <span className="text-xs text-gray-400 font-medium">
                  {Math.ceil((new Date(activeProject.expectedDepartureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} jours
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Date de départ</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeProject?.expectedDepartureDate
                  ? new Date(activeProject.expectedDepartureDate).toLocaleDateString('fr-FR', { 
                      day: 'numeric',
                      month: 'short', 
                      year: 'numeric' 
                    })
                  : 'Non défini'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 font-medium">Par mois</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Budget logement</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeProject?.housingBudget
                  ? `${activeProject.housingBudget} ${countryData?.currency || '€'}`
                  : 'Non défini'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 font-medium">Estimé</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Durée du séjour</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeProject?.expectedDuration ? `${activeProject.expectedDuration} mois` : 'Non défini'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {visibleWidgets.map(renderWidget)}
          
          {editMode && (
            <button
              onClick={() => setShowAddWidget(true)}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
            >
              <Plus className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Ajouter un widget</span>
            </button>
          )}
        </div>

        {hiddenWidgets.length > 0 && editMode && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Widgets masqués</h3>
            <div className="flex flex-wrap gap-2">
              {hiddenWidgets.map((widgetId) => (
                <button
                  key={widgetId}
                  onClick={() => toggleWidgetVisibility(widgetId)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Restaurer {widgetId.replace('-', ' ')}
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
                <h2 className="text-2xl font-bold text-gray-900">Bibliothèque de widgets</h2>
                <p className="text-gray-500 mt-1">
                  Personnalisez votre tableau de bord en ajoutant les outils dont vous avez besoin.
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
                          : 'border-white bg-white shadow-sm hover:border-blue-500 hover:shadow-md cursor-pointer'
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
                              Ajouté
                            </span>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed ${isAdded ? 'text-gray-400' : 'text-gray-500'}`}>
                          {widget.description}
                        </p>
                        
                        {!isAdded && (
                          <div className="mt-4 flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <Plus className="w-4 h-4 mr-1" />
                            Ajouter au dashboard
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
                Terminé
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}