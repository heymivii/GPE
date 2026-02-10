import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface UserData {
  id: string
  name: string
  email: string
  onboardingCompleted: boolean
  onboardingData?: {
    destination: {
      fromCountry: string
      toCountry: string
      targetCity: string
      departureYear: string
    }
    profile: {
      age: string
      status: string
      travelParty: string
      languageLevel: string
    }
    objective: {
      goal: string
      stayDuration: string
    }
    preparation: {
      stepsDone: string[]
      housingBudget: string
    }
    needs: {
      priorities: string[]
      needPersonalizedSupport: boolean
    }
  }
}

interface UserPreferences {
  dashboardLayout: string[]
  favoriteWidgets: string[]
  hiddenWidgets: string[]
}

export default function useUserData() {
  const { t } = useTranslation()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences>({
    dashboardLayout: ['profile-summary', 'objectives', 'recommendations', 'checklist', 'budget-tracker'],
    favoriteWidgets: [],
    hiddenWidgets: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      const savedOnboardingData = localStorage.getItem('skywalk-user-data')
      const isCompleted = localStorage.getItem('skywalk-onboarding-completed') === 'true'
      
      if (savedOnboardingData && isCompleted) {
        const onboardingData = JSON.parse(savedOnboardingData)
        
        const userData: UserData = {
          id: '1',
          name: 'SkyWalk User',
          email: 'user@skywalk.com',
          onboardingCompleted: true,
          onboardingData: onboardingData
        }
        
        await new Promise(resolve => setTimeout(resolve, 500))
        setUserData(userData)
      } else {
        setUserData({
          id: '1',
          name: 'SkyWalk User',
          email: 'user@skywalk.com',
          onboardingCompleted: false
        })
      }
      
      const savedPreferences = localStorage.getItem('dashboard-preferences')
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences))
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.loadingError'))
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPreferences }
    setPreferences(updated)
    localStorage.setItem('dashboard-preferences', JSON.stringify(updated))
  }

  const toggleWidgetVisibility = (widgetId: string) => {
    const isHidden = preferences.hiddenWidgets.includes(widgetId)
    const hiddenWidgets = isHidden
      ? preferences.hiddenWidgets.filter(id => id !== widgetId)
      : [...preferences.hiddenWidgets, widgetId]
    
    updatePreferences({ hiddenWidgets })
  }

  const reorderWidgets = (newOrder: string[]) => {
    updatePreferences({ dashboardLayout: newOrder })
  }

  return {
    userData,
    preferences,
    loading,
    error,
    updatePreferences,
    toggleWidgetVisibility,
    reorderWidgets,
    refetch: loadUserData
  }
}