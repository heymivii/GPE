import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../hooks/useAuth'
import OnboardingLayout from '../components/OnboardingLayout'
import DestinationStep from '../pages/DestinationStep'
import ProfileStep from '../pages/ProfileStep'
import ObjectiveStep from '../pages/ObjectiveStep'
import PreparationStep from '../pages/PreparationStep'
import NeedsStep from '../pages/NeedsStep'
import SummaryStep from '../pages/SummaryStep'
import AuthGateStep from '../pages/AuthGateStep'
import useOnboarding, { type OnboardingData } from '../hooks/useOnboarding'
import { useCreateProject, useUpdateProject } from '../../projects/hooks/useProjectMutations'
import { useProjects } from '../../projects/hooks/useProjectMutations'
import { countryApi } from '../../../api/country'
import { userApi } from '../../../api/user'
import { useCountryData, useCountryDataByCode } from '../../../hooks/useCountryData'
import type {
  UpdateExpatriationProjectDto,
  CreateExpatriationProjectDto
} from '../../../types/expatriation-project'

const CURRENCY_SYMBOLS: Record<string, string> = {
  'EUR': '€',
  'USD': '$',
  'GBP': '£',
  'JPY': '¥',
  'AUD': 'A$',
  'CAD': 'C$',
  'CHF': 'CHF',
}

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const editMode = !!id
  // Mode édition : vrai une fois les données du projet injectées dans le wizard.
  // Tant que c'est faux on ne monte PAS les étapes : elles initialisent leur état
  // local au premier rendu, un montage précoce les figerait vides (seule
  // DestinationStep se resynchronisait — Profile/Objective/Preparation/Needs non).
  const [editHydrated, setEditHydrated] = useState(false)
  const dataLoadedRef = useRef(false)
  const profileLoadedRef = useRef(false)
  const { isAuthenticated, isLoading: isAuthLoading, refreshUser, user } = useAuth()
  const originCountryData = useCountryData(user?.countryOriginId)
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const saveAttemptedRef = useRef(false)

  const { mutateAsync: createProject, isPending: isCreatingProject } = useCreateProject()
  const { mutateAsync: updateProject, isPending: isUpdatingProject } = useUpdateProject()
  const { data: projects } = useProjects(editMode)

  // NB: no auth wall here — the wizard runs ANONYMOUSLY (draft kept in localStorage) so the
  // user gets value before committing. Registration is requested only at save time via
  // handleComplete → AuthGateStep (redirect …?save=true → auto-save on return).

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: countryApi.getAll
  })

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
  } = useOnboarding(editMode)

  // Prefill destination from the landing preview (?to=XX), once, if not already set.
  const preInitRef = useRef(false)
  useEffect(() => {
    if (preInitRef.current || editMode) return
    const to = searchParams.get('to')
    if (to && !data.destination?.toCountry) {
      preInitRef.current = true
      updateStepData('destination', { toCountry: to.toUpperCase() } as OnboardingData['destination'])
    }
  }, [searchParams, editMode, data.destination?.toCountry, updateStepData])

  const formOriginCountryData = useCountryDataByCode(data.destination?.fromCountry)
  const rawCurrency = formOriginCountryData?.currency || originCountryData?.currency || 'EUR'
  const currency = formOriginCountryData?.currencySymbol || originCountryData?.currencySymbol || CURRENCY_SYMBOLS[rawCurrency] || rawCurrency

  useEffect(() => {
    if (existingProject && editMode && !dataLoadedRef.current && countries.length > 0 && user) {
      dataLoadedRef.current = true;

      const objectiveReverseMapping: Record<string, string> = {
        'study': 'studies',
        'work': 'work',
        'adventure': 'discovery',
        'family_reunion': 'family',
        'retirement': 'other',
        'other': 'other'
      }

      const durationReverseMapping: Record<number, string> = {
        3: 'less_6_months',
        9: '6_12_months',
        24: '1_3_years',
        48: 'more_3_years'
      }

      const destinationCountry = countries.find(c => c.idCountry === existingProject.idDestinationCountry);
      const destinationIsoCode = destinationCountry?.isoCode || '';

      // Le pays de départ n'est PAS porté par le projet : il vit sur le profil
      // (`user.countryOriginId`). Pas de repli « FR » en dur — il fabriquait des
      // projets « France → France » que les selects verrouillés rendaient incorrigibles.
      const originCountry = countries.find(c => c.idCountry === user?.countryOriginId);
      const originIsoCode = originCountry?.isoCode || '';
      // Donnée héritée incohérente (départ == destination) : on vide le départ pour
      // forcer un choix explicite plutôt que d'afficher un projet impossible.
      const safeOriginIsoCode =
        originIsoCode && originIsoCode !== destinationIsoCode ? originIsoCode : '';

      const projectData = {
        destination: {
          fromCountry: safeOriginIsoCode,
          toCountry: destinationIsoCode,
          targetCity: existingProject.idDestinationCity?.toString() || '',
          departureYear: existingProject.expectedDepartureDate
            ? new Date(existingProject.expectedDepartureDate).getFullYear().toString()
            : new Date().getFullYear().toString(),
          departureDate: existingProject.expectedDepartureDate
            ? new Date(existingProject.expectedDepartureDate).toISOString().slice(0, 10)
            : '',
          nationality: existingProject.nationality || ''
        },
        profile: {
          age: user.age?.toString() || '25',
          status: user.status || '',
          travelParty: existingProject.travelType || 'alone',
          languageLevel: user.languageLevel || existingProject.languageLevel || '',
          motherTongue: user.motherTongue || '',
          spokenLanguages: user.spokenLanguages || [],
          hasChildren: existingProject.hasChildren ?? undefined,
          hasJobOffer: existingProject.hasJobOffer ?? undefined
        },
        objective: {
          goal: objectiveReverseMapping[existingProject.mainObjective || ''] || 'other',
          stayDuration: durationReverseMapping[existingProject.expectedDuration || 12] || '6_12_months'
        },
        preparation: {
          stepsDone: existingProject.stepsDone ? existingProject.stepsDone.split(',').map(s => s.trim()) : [],
          housingBudget: existingProject.housingBudget?.toString() || '0'
        },
        needs: {
          priorities: existingProject.priorities?.split(',').map(p => p.trim()) || []
        }
      };

      setAllData(projectData);
      setEditHydrated(true);

    }
  }, [existingProject, editMode, countries, setAllData, user])

  useEffect(() => {
    if (!editMode && isAuthenticated && user && countries.length > 0 && !profileLoadedRef.current) {


      const originCountry = countries.find(c => c.idCountry === user.countryOriginId);

      const profileData: {
        age?: string;
        status?: string;
        languageLevel?: string;
        motherTongue?: string;
        spokenLanguages?: string[];
      } = {};
      const destinationData: { fromCountry?: string } = {};
      let hasUpdates = false;

      if (user.age) {
        profileData.age = user.age.toString();
        hasUpdates = true;
      }
      if (user.status) {
        profileData.status = user.status;
        hasUpdates = true;
      }
      if (user.languageLevel) {
        profileData.languageLevel = user.languageLevel;
        hasUpdates = true;
      }
      if (user.motherTongue) {
        profileData.motherTongue = user.motherTongue;
        hasUpdates = true;
      }
      if (user.spokenLanguages && user.spokenLanguages.length > 0) {
        profileData.spokenLanguages = user.spokenLanguages;
        hasUpdates = true;
      }

      if (originCountry) {
        destinationData.fromCountry = originCountry.isoCode;
        hasUpdates = true;
      }

      if (hasUpdates) {
        setAllData({
          profile: {
            ...(data.profile || {}),
            ...profileData,
            travelParty: data.profile?.travelParty || 'alone',
            age: profileData.age || data.profile?.age || '',
            status: profileData.status || data.profile?.status || '',
            languageLevel: profileData.languageLevel || data.profile?.languageLevel || '',
            motherTongue: profileData.motherTongue || data.profile?.motherTongue || '',
            spokenLanguages: profileData.spokenLanguages || data.profile?.spokenLanguages || []
          },
          destination: {
            ...(data.destination || {}),
            ...destinationData,
            fromCountry: destinationData.fromCountry || data.destination?.fromCountry || '',
            toCountry: data.destination?.toCountry || '',
            targetCity: data.destination?.targetCity || '',
            departureYear: data.destination?.departureYear || ''
          }
        });

        if (!localStorage.getItem('skywalk-onboarding-draft')) {
          toast.success(t('onboarding.profilePrefilled'), { id: 'profile-prefill' });
        }
      }

      profileLoadedRef.current = true;
    }
  }, [editMode, isAuthenticated, user, countries, setAllData, data.profile, data.destination, t])

  const handleStepClick = (stepId: number) => {
    if (canGoToStep(stepId)) {
      goToStep(stepId)
    }
  }

  const handleComplete = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        setShowAuthGate(true)
        return;
      }


      const originCountry = countries.find(c => c.isoCode === data.destination?.fromCountry);
      const originCountryId = originCountry?.idCountry;

      if (data.profile) {
        try {
          await userApi.updateProfile({
            age: data.profile.age ? parseInt(data.profile.age) : undefined,
            // status (emploi) et languageLevel vivent sur le User — c'est ce que la page
            // profil affiche. Les y écrire ici, sinon ces deux champs restent vides.
            status: data.profile.status || undefined,
            languageLevel: data.profile.languageLevel || undefined,
            motherTongue: data.profile.motherTongue,
            spokenLanguages: data.profile.spokenLanguages,
            countryOriginId: originCountryId,
          });
          await refreshUser();
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      }
      const destinationCountry = countries.find(c => c.isoCode === data.destination?.toCountry);
      const destinationCountryId = destinationCountry?.idCountry;

      if (!destinationCountryId) {
        toast.error(t('onboarding.invalidDestination'));
        return;
      }

      const objectiveMapping: Record<string, string> = {
        'studies': 'study',
        'work': 'work',
        'discovery': 'adventure',
        'family': 'family_reunion',
        'internship': 'work',
        'other': 'other'
      };

      const durationMapping: Record<string, number> = {
        'less_6_months': 3,
        '6_12_months': 9,
        '1_3_years': 24,
        'more_3_years': 48
      };

      const projectData: UpdateExpatriationProjectDto = {
        idDestinationCountry: destinationCountryId,
        idOriginCountry: originCountryId,
        idDestinationCity: data.destination?.targetCity && !isNaN(parseInt(data.destination.targetCity, 10))
          ? parseInt(data.destination.targetCity, 10)
          : null,
        languageLevel: data.profile?.languageLevel,
        travelType: data.profile?.travelParty as 'alone' | 'couple' | 'family' | 'friends' | 'other',
        mainObjective: (objectiveMapping[data.objective?.goal || ''] || 'other') as 'work' | 'study' | 'retirement' | 'adventure' | 'family_reunion' | 'other',
        expectedDuration: durationMapping[data.objective?.stayDuration || '6_12_months'] || 12,
        housingBudget: parseFloat(data.preparation?.housingBudget || '0'),
        stepsDone: data.preparation?.stepsDone?.join(',') || '',
        priorities: data.needs?.priorities?.join(', ') || '',
        projectStatus: 'planning' as const,
        expectedDepartureDate:
          data.destination?.departureDate ||
          (data.destination?.departureYear ? `${data.destination.departureYear}-01-01` : undefined),
        nationality: data.destination?.nationality || undefined,
        hasChildren: data.profile?.hasChildren,
        hasJobOffer: data.profile?.hasJobOffer,
      };


      if (editMode && id) {

        const countryChanged = existingProject &&
          existingProject.idDestinationCountry !== destinationCountryId;

        if (countryChanged) {
          const confirmed = window.confirm(t('onboarding.countryChangeWarning'));

          if (!confirmed) {
            toast(t('onboarding.modificationCancelled'));
            return;
          }

          projectData.checklistProgress = {};
          toast(t('onboarding.checklistReset'), {
            duration: 5000
          });
        }

        await updateProject({
          projectId: Number(id),
          data: projectData
        });

        toast.success(t('onboarding.projectUpdated'));

        navigate(`/projects/${id}`);
      } else {
        await createProject(projectData as CreateExpatriationProjectDto);

        localStorage.setItem('skywalk-user-data', JSON.stringify(data))
        localStorage.setItem('skywalk-onboarding-completed', 'true')

        clearDraft()

        toast.success(t('onboarding.projectCreated'));

        navigate(`/projects`);
      }

    } catch (error) {
      console.error('Error completing onboarding:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string | string[] } }; message?: string };
        const errorMessage = axiosError.response?.data?.message || axiosError.message;
        const errorDetails = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
        toast.error(`${t('onboarding.errorPrefix')}: ${errorDetails}`);
        console.error('Backend error details:', axiosError.response?.data);
      } else if (error instanceof Error) {
        toast.error(`${t('onboarding.errorPrefix')}: ${error.message}`);
      } else {
        toast.error(t('onboarding.genericError'));
      }
    }
  }, [isAuthenticated, data, countries, editMode, id, existingProject, updateProject, createProject, navigate, clearDraft, refreshUser, t])

  useEffect(() => {
    const paramShouldSave = searchParams.get('save') === 'true';
    const localShouldSave = localStorage.getItem('skywalk-should-save') === 'true';
    const shouldSave = paramShouldSave || localShouldSave;

    const tryAutoSave = async () => {
      if (isAuthLoading) {
        return;
      }

      if (Object.keys(data).length === 0) {
        return;
      }

      if (shouldSave && !isAuthenticated && !saveAttemptedRef.current) {

        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
          await refreshUser();
          return;
        } catch (e) {
          console.error('Refresh failed', e);
          setShowAuthGate(true);
          return;
        }
      }

      if (
        shouldSave &&
        isAuthenticated &&
        countries.length > 0 &&
        !saveAttemptedRef.current
      ) {
        toast.loading(t('onboarding.creatingProject'), { id: 'auto-save' });
        saveAttemptedRef.current = true;

        localStorage.removeItem('skywalk-should-save');

        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('save');
          return newParams;
        });

        await handleComplete();
        toast.dismiss('auto-save');
      }
    };

    tryAutoSave();
  }, [isAuthenticated, isAuthLoading, countries, data, handleComplete, setSearchParams, refreshUser, searchParams, t]);

  const renderCurrentStep = () => {

    if (showAuthGate) {
      return (
        <AuthGateStep
          age={data.profile?.age}
          onBack={() => setShowAuthGate(false)}
        />
      )
    }

    switch (currentStep) {
      case 1:
        return (
          <DestinationStep
            data={data.destination}
            isEditMode={editMode}
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
            onSkip={nextStep}
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
            onSkip={nextStep}
            currency={currency}
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
            onSkip={nextStep}
          />
        )
      case 6:
        return (
          <SummaryStep
            data={data as Required<typeof data>}
            isEditMode={editMode}
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

  // Attente d'hydratation en édition : projets en cours de chargement, ou projet
  // trouvé mais données pas encore injectées. Un id sans projet correspondant ou un
  // visiteur non connecté passent au rendu normal (pas de spinner sans fin).
  const waitingForHydration =
    editMode && isAuthenticated && !editHydrated && (!projects || !!existingProject)

  if (waitingForHydration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    )
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