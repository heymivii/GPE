import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Step } from '../components/Stepper'

export interface OnboardingData {
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
    motherTongue?: string
    spokenLanguages?: string[]
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
  }
}

const STORAGE_KEY = 'skywalk-onboarding-draft'

export default function useOnboarding(skipLocalStorage = false) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<Partial<OnboardingData>>({})

  useEffect(() => {
    if (skipLocalStorage) {
      return;
    }

    const savedDraft = localStorage.getItem(STORAGE_KEY)
    if (savedDraft) {
      try {
        const parsedData = JSON.parse(savedDraft)
        setData(parsedData.data || {})
        setCurrentStep(parsedData.currentStep || 1)
      } catch (error) {
        console.error('Error loading onboarding draft:', error)
      }
    }
  }, [skipLocalStorage])

  useEffect(() => {
    if (skipLocalStorage) return;

    if (Object.keys(data).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, currentStep }))
    }
  }, [data, currentStep, skipLocalStorage])

  const updateStepData = <T extends keyof OnboardingData>(
    step: T,
    stepData: OnboardingData[T]
  ) => {
    setData(prev => ({
      ...prev,
      [step]: stepData
    }))
  }

  const setAllData = (allData: Partial<OnboardingData>) => {
    setData(prev => ({
      ...prev,
      ...allData
    }))
  }

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 6) {
      setCurrentStep(step)
    }
  }

  const getSteps = (): Step[] => {
    return [
      { id: 1, label: t('onboarding.steps.destination'), state: getStepState(1) },
      { id: 2, label: t('onboarding.steps.profile'), state: getStepState(2) },
      { id: 3, label: t('onboarding.steps.objective'), state: getStepState(3) },
      { id: 4, label: t('onboarding.steps.preparation'), state: getStepState(4) },
      { id: 5, label: t('onboarding.steps.needs'), state: getStepState(5) },
      { id: 6, label: t('onboarding.steps.summary'), state: getStepState(6) }
    ]
  }

  const getStepState = (step: number): 'todo' | 'current' | 'done' => {
    if (step === currentStep) return 'current'
    if (step < currentStep) return 'done'
    return 'todo'
  }

  const isStepCompleted = (step: keyof OnboardingData): boolean => {
    const stepData = data[step]
    if (!stepData) return false

    switch (step) {
      case 'destination':
        return !!(stepData as OnboardingData['destination']).fromCountry &&
          !!(stepData as OnboardingData['destination']).toCountry &&
          !!(stepData as OnboardingData['destination']).departureYear
      case 'profile':
        return !!(stepData as OnboardingData['profile']).age &&
          !!(stepData as OnboardingData['profile']).status &&
          !!(stepData as OnboardingData['profile']).travelParty &&
          !!(stepData as OnboardingData['profile']).languageLevel
      case 'objective':
        return !!(stepData as OnboardingData['objective']).goal &&
          !!(stepData as OnboardingData['objective']).stayDuration
      case 'preparation':
        return !!(stepData as OnboardingData['preparation']).housingBudget
      case 'needs':
        return (stepData as OnboardingData['needs']).priorities.length > 0
      default:
        return false
    }
  }

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY)
    setData({})
    setCurrentStep(1)
  }

  const canGoToStep = (step: number): boolean => {
    if (step <= currentStep) return true

    const stepKeys: (keyof OnboardingData)[] = ['destination', 'profile', 'objective', 'preparation', 'needs']
    for (let i = 0; i < step - 1; i++) {
      if (!isStepCompleted(stepKeys[i])) {
        return false
      }
    }
    return true
  }

  return {
    currentStep,
    data,
    updateStepData,
    setAllData,
    nextStep,
    prevStep,
    goToStep,
    getSteps,
    isStepCompleted,
    canGoToStep,
    clearDraft
  }
}