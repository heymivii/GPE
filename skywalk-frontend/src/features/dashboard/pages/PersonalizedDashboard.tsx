import { useState } from 'react'
import { Settings, Plus, LayoutGrid } from 'lucide-react'
import useUserData from '../hooks/useUserData'
import ProfileSummaryWidget from '../widgets/ProfileSummaryWidget'
import RecommendationsWidget from '../widgets/RecommendationsWidget'
import ChecklistWidget from '../widgets/ChecklistWidget'
import BudgetTrackerWidget from '../widgets/BudgetTrackerWidget'

export default function PersonalizedDashboard() {
  const { userData, preferences, loading, error, toggleWidgetVisibility } = useUserData()
  const [editMode, setEditMode] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre dashboard personnalisé...</p>
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement de vos données</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const { onboardingData } = userData

  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Dashboard en cours de préparation
          </h2>
          <p className="text-gray-600 mb-6">
            Complétez votre onboarding pour accéder à votre dashboard personnalisé
          </p>
          <button 
            onClick={() => window.location.href = '/onboarding'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Compléter mon profil
          </button>
        </div>
      </div>
    )
  }

  const visibleWidgets = preferences.dashboardLayout.filter(
    widgetId => !preferences.hiddenWidgets.includes(widgetId)
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
            userPriorities={onboardingData.needs.priorities}
            destination={onboardingData.destination.toCountry}
            {...commonProps}
          />
        )
      
      case 'checklist':
        return (
          <ChecklistWidget
            key={widgetId}
            userStepsDone={onboardingData.preparation.stepsDone}
            {...commonProps}
          />
        )
      
      case 'budget-tracker':
        return (
          <BudgetTrackerWidget
            key={widgetId}
            housingBudget={onboardingData.preparation.housingBudget}
            {...commonProps}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bonjour {userData.name} ! 👋
              </h1>
              <p className="text-sm text-gray-600">
                Votre projet d'expatriation vers {onboardingData.destination.toCountry}
              </p>
            </div>
            <div className="flex items-center space-x-3">
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
              <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Paramètres</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {editMode && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Mode édition activé</strong> - Cliquez sur le menu (⋯) de chaque widget pour le modifier ou le masquer
            </p>
          </div>
        )}

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {visibleWidgets.map(renderWidget)}
          
          {/* Widget "Ajouter" en mode édition */}
          {editMode && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 cursor-pointer">
              <Plus className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Ajouter un widget</span>
            </div>
          )}
        </div>

        {/* Widgets masqués */}
        {preferences.hiddenWidgets.length > 0 && editMode && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Widgets masqués</h3>
            <div className="flex flex-wrap gap-2">
              {preferences.hiddenWidgets.map((widgetId) => (
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
    </div>
  )
}