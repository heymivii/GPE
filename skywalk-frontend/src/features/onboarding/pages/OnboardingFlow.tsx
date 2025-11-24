import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import OnboardingLayout from '../components/OnboardingLayout'
import DestinationStep from '../pages/DestinationStep'
import ProfileStep from '../pages/ProfileStep'
import ObjectiveStep from '../pages/ObjectiveStep'
import PreparationStep from '../pages/PreparationStep'
import NeedsStep from '../pages/NeedsStep'
import SummaryStep from '../pages/SummaryStep'
import useOnboarding from '../hooks/useOnboarding'
import { useCreateProject } from '../../projects/hooks/useProjectMutations'

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const { mutateAsync: createProject, isPending: isCreatingProject } = useCreateProject()
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
      
      // Mapping temporaire des codes pays vers des IDs
      // TODO: Récupérer les vrais IDs depuis l'API /countries
      const countryCodeToId: Record<string, number> = {
        'FR': 1, 'CA': 2, 'CH': 3, 'DE': 4, 'ES': 5, 'IT': 6,
        'PT': 7, 'BE': 8, 'NL': 9, 'LU': 10, 'GB': 11, 'IE': 12,
        'US': 13, 'AU': 14, 'NZ': 15, 'JP': 16, 'SG': 17, 'AE': 18,
        'MX': 19, 'BR': 20
      };
      
      // Convertir le code pays en ID
      const destinationCountryId = countryCodeToId[data.destination.toCountry];
      
      if (!destinationCountryId) {
        toast.error('Pays de destination invalide');
        return;
      }

      // Mapping des objectifs pour correspondre au backend
      const objectiveMapping: Record<string, string> = {
        'studies': 'study',
        'work': 'work',
        'discovery': 'adventure',
        'family': 'family_reunion',
        'internship': 'work',
        'other': 'other'
      };

      // Mapping des durées vers des nombres de mois
      const durationMapping: Record<string, number> = {
        'less_6_months': 3,
        '6_12_months': 9,
        '1_3_years': 24,
        'more_3_years': 48
      };
      
      // Créer le projet d'expatriation avec les données du formulaire
      const projectData = {
        idDestinationCountry: destinationCountryId,
        idDestinationCity: data.destination.targetCity ? parseInt(data.destination.targetCity) : undefined,
        travelType: data.profile.travelParty as 'alone' | 'couple' | 'family' | 'friends' | 'other',
        mainObjective: (objectiveMapping[data.objective.goal] || 'other') as 'work' | 'study' | 'retirement' | 'adventure' | 'family_reunion' | 'other',
        expectedDuration: durationMapping[data.objective.stayDuration] || 12,
        housingBudget: parseFloat(data.preparation.housingBudget),
        priorities: data.needs.priorities.join(', '),
        needsSupport: data.needs.needPersonalizedSupport || false,
        projectStatus: 'planning' as const,
        expectedDepartureDate: data.destination.departureYear ? `${data.destination.departureYear}-01-01` : undefined,
      };

      console.log('Creating project with data:', projectData);
      const newProject = await createProject(projectData);
      console.log('Project created:', newProject);
      
      // Sauvegarder les données dans le localStorage pour référence
      localStorage.setItem('skywalk-user-data', JSON.stringify(data))
      localStorage.setItem('skywalk-onboarding-completed', 'true')
      
      // Clear draft
      clearDraft()
      
      // Rediriger vers la page du projet créé
      navigate(`/projects`)
      
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Le toast d'erreur est déjà géré par le hook useCreateProject
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
            isSubmitting={isCreatingProject}
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