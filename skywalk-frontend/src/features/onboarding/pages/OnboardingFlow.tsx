import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../components/OnboardingLayout'
import DestinationStep from '../pages/DestinationStep'
import ProfileStep from '../pages/ProfileStep'
import ObjectiveStep from '../pages/ObjectiveStep'
import PreparationStep from '../pages/PreparationStep'
import NeedsStep from '../pages/NeedsStep'
import SummaryStep from '../pages/SummaryStep'
import useOnboarding from '../hooks/useOnboarding'

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const {
    currentStep,
    data,
    updateStepData,
    nextStep,
    prevStep,
    goToStep,
    getSteps,
    canGoToStep,
    clearDraft
  } = useOnboarding()

  const handleStepClick = (stepId: number) => {
    if (canGoToStep(stepId)) {
      goToStep(stepId)
    }
  }

  const handleComplete = async () => {
    try {
      console.log('Submitting onboarding data:', data)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      localStorage.setItem('skywalk-user-data', JSON.stringify(data))
      
      clearDraft()
      localStorage.setItem('skywalk-onboarding-completed', 'true')
      
      navigate('/personalized')
      
      /*
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      */
      
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DestinationStep
            data={data.destination}
            onNext={(stepData) => {
              updateStepData('destination', stepData)
              nextStep()
            }}
          />
        )
      case 2:
        return (
          <ProfileStep
            data={data.profile}
            onNext={(stepData) => {
              updateStepData('profile', stepData)
              nextStep()
            }}
            onBack={prevStep}
          />
        )
      case 3:
        return (
          <ObjectiveStep
            data={data.objective}
            onNext={(stepData) => {
              updateStepData('objective', stepData)
              nextStep()
            }}
            onBack={prevStep}
          />
        )
      case 4:
        return (
          <PreparationStep
            data={data.preparation}
            onNext={(stepData) => {
              updateStepData('preparation', stepData)
              nextStep()
            }}
            onBack={prevStep}
          />
        )
      case 5:
        return (
          <NeedsStep
            data={data.needs}
            onNext={(stepData) => {
              updateStepData('needs', stepData)
              nextStep()
            }}
            onBack={prevStep}
          />
        )
      case 6:
        return (
          <SummaryStep
            data={data as Required<typeof data>}
            onBack={prevStep}
            onEdit={goToStep}
            onComplete={handleComplete}
          />
        )
      default:
        return null
    }
  }

  return (
    <OnboardingLayout
      steps={getSteps()}
      onStepClick={handleStepClick}
    >
      {renderCurrentStep()}
    </OnboardingLayout>
  )
}