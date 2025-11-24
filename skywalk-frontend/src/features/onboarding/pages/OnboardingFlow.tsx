import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useEffect, useRef } from 'react'
import OnboardingLayout from '../components/OnboardingLayout'
import DestinationStep from '../pages/DestinationStep'
import ProfileStep from '../pages/ProfileStep'
import ObjectiveStep from '../pages/ObjectiveStep'
import PreparationStep from '../pages/PreparationStep'
import NeedsStep from '../pages/NeedsStep'
import SummaryStep from '../pages/SummaryStep'
import useOnboarding from '../hooks/useOnboarding'
import { useCreateProject, useUpdateProject } from '../../projects/hooks/useProjectMutations'
import { useProjects } from '../../projects/hooks/useProjectMutations'

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const editMode = !!id
  const dataLoadedRef = useRef(false)
  
  const { mutateAsync: createProject, isPending: isCreatingProject } = useCreateProject()
  const { mutateAsync: updateProject, isPending: isUpdatingProject } = useUpdateProject()
  const { data: projects } = useProjects()
  
  const existingProject = editMode ? projects?.find((p) => p.idProject === Number(id)) : null
  
  const {
    currentStep,
    data,
    updateStepData,
    setAllData,
    nextStep,
    prevStep,
    goToStep,
    getSteps,
    canGoToStep,
    clearDraft
  } = useOnboarding(editMode) // Skip localStorage in edit mode

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (existingProject && editMode && !dataLoadedRef.current) {
      console.log('Loading existing project data:', existingProject);
      dataLoadedRef.current = true;
      
      // Mapping inverse des objectifs
      const objectiveReverseMapping: Record<string, string> = {
        'study': 'studies',
        'work': 'work',
        'adventure': 'discovery',
        'family_reunion': 'family',
        'retirement': 'other',
        'other': 'other'
      }

      // Mapping inverse des durées
      const durationReverseMapping: Record<number, string> = {
        3: 'less_6_months',
        9: '6_12_months',
        24: '1_3_years',
        48: 'more_3_years'
      }

      // Charger toutes les données en une seule fois
      const projectData = {
        destination: {
          fromCountry: 'FR',
          toCountry: existingProject.idDestinationCountry?.toString() || '',
          targetCity: existingProject.idDestinationCity?.toString() || '',
          departureYear: existingProject.expectedDepartureDate 
            ? new Date(existingProject.expectedDepartureDate).getFullYear().toString()
            : new Date().getFullYear().toString()
        },
        profile: {
          age: '25',
          status: 'single',
          travelParty: existingProject.travelType || 'alone',
          languageLevel: 'intermediate'
        },
        objective: {
          goal: objectiveReverseMapping[existingProject.mainObjective || ''] || 'other',
          stayDuration: durationReverseMapping[existingProject.expectedDuration || 12] || '6_12_months'
        },
        preparation: {
          stepsDone: [],
          housingBudget: existingProject.housingBudget?.toString() || '0'
        },
        needs: {
          priorities: existingProject.priorities?.split(',').map(p => p.trim()) || [],
          needPersonalizedSupport: existingProject.needsSupport || false
        }
      };

      // Charger toutes les données d'un coup avec setAllData
      setAllData(projectData);
      
      console.log('Project data loaded successfully', projectData);
      console.log('Current data state:', data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProject, editMode])

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
      
      // Préparer les données du projet
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

      if (editMode && id) {
        // Mode édition : mettre à jour le projet existant
        console.log('Updating project with data:', projectData);
        await updateProject({
          projectId: Number(id),
          data: projectData
        });
        console.log('Project updated');
        
        toast.success('Projet mis à jour avec succès !');
        
        // Rediriger vers le dashboard personnalisé ou la liste des projets
        navigate(`/projects/${id}`);
      } else {
        // Mode création : créer un nouveau projet
        console.log('Creating project with data:', projectData);
        const newProject = await createProject(projectData);
        console.log('Project created:', newProject);
        
        // Sauvegarder les données dans le localStorage pour référence
        localStorage.setItem('skywalk-user-data', JSON.stringify(data))
        localStorage.setItem('skywalk-onboarding-completed', 'true')
        
        // Clear draft
        clearDraft()
        
        toast.success('Projet créé avec succès !');
        
        // Rediriger vers la page des projets
        navigate(`/projects`);
      }
      
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Le toast d'erreur est déjà géré par les hooks
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
            isSubmitting={isCreatingProject || isUpdatingProject}
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
      title={editMode ? 'Modifier mon projet' : undefined}
    >
      {renderCurrentStep()}
    </OnboardingLayout>
  )
}