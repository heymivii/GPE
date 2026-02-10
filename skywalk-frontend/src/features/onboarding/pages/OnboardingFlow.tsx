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
import useOnboarding from '../hooks/useOnboarding'
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
  const dataLoadedRef = useRef(false)
  const profileLoadedRef = useRef(false)
  const { isAuthenticated, isLoading: isAuthLoading, refreshUser, user } = useAuth()
  const originCountryData = useCountryData(user?.idOriginCountry)
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const saveAttemptedRef = useRef(false)
  
  const { mutateAsync: createProject, isPending: isCreatingProject } = useCreateProject()
  const { mutateAsync: updateProject, isPending: isUpdatingProject } = useUpdateProject()
  const { data: projects } = useProjects(editMode)
  
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/auth/register?redirect=/onboarding');
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

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

      const originCountry = countries.find(c => c.idCountry === user?.idOriginCountry);
      const originIsoCode = originCountry?.isoCode || 'FR';

      const projectData = {
        destination: {
          fromCountry: originIsoCode,
          toCountry: destinationIsoCode,
          targetCity: existingProject.idDestinationCity?.toString() || '',
          departureYear: existingProject.expectedDepartureDate 
            ? new Date(existingProject.expectedDepartureDate).getFullYear().toString()
            : new Date().getFullYear().toString()
        },
        profile: {
          age: user.age?.toString() || '25',
          status: user.status || 'single',
          travelParty: existingProject.travelType || 'alone',
          languageLevel: user.languageLevel || existingProject.languageLevel || 'intermediate',
          motherTongue: user.motherTongue || '',
          spokenLanguages: user.spokenLanguages || []
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
          priorities: existingProject.priorities?.split(',').map(p => p.trim()) || [],
          needPersonalizedSupport: existingProject.needsSupport || false
        }
      };

      setAllData(projectData);
      
    }
  }, [existingProject, editMode, countries, setAllData, user])

  useEffect(() => {
    if (!editMode && isAuthenticated && user && countries.length > 0 && !profileLoadedRef.current) {
      
      
      const originCountry = countries.find(c => c.idCountry === user.idOriginCountry);
      
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
  }, [editMode, isAuthenticated, user, countries, setAllData, data.profile, data.destination])

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

  
      if (data.profile) {
        try {
          await userApi.updateProfile({
            age: data.profile.age ? parseInt(data.profile.age) : undefined,
            status: data.profile.status,
            languageLevel: data.profile.languageLevel,
            motherTongue: data.profile.motherTongue,
            spokenLanguages: data.profile.spokenLanguages,
          });
          await refreshUser();
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      }

      const destinationCountry = countries.find(c => c.isoCode === data.destination?.toCountry);
      const destinationCountryId = destinationCountry?.idCountry;

      const originCountry = countries.find(c => c.isoCode === data.destination?.fromCountry);
      const originCountryId = originCountry?.idCountry;
      
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
        languageLevel: data.profile?.languageLevel,
        travelType: data.profile?.travelParty as 'alone' | 'couple' | 'family' | 'friends' | 'other',
        mainObjective: (objectiveMapping[data.objective?.goal || ''] || 'other') as 'work' | 'study' | 'retirement' | 'adventure' | 'family_reunion' | 'other',
        expectedDuration: durationMapping[data.objective?.stayDuration || '6_12_months'] || 12,
        housingBudget: parseFloat(data.preparation?.housingBudget || '0'),
        stepsDone: data.preparation?.stepsDone?.join(',') || '',
        priorities: data.needs?.priorities?.join(', ') || '',
        needsSupport: data.needs?.needPersonalizedSupport || false,
        projectStatus: 'planning' as const,
        expectedDepartureDate: data.destination?.departureYear ? `${data.destination.departureYear}-01-01` : undefined,
      };


      if (editMode && id) {
        
        const countryChanged = existingProject && 
          existingProject.idDestinationCountry !== destinationCountryId;
        
        if (countryChanged) {
          const confirmed = window.confirm(t('onboarding.countryChangeWarning'));
          
          if (!confirmed) {
            toast(t('onboarding.modificationCancelled'), { icon: 'ℹ️' });
            return;
          }
          
          projectData.checklistProgress = {};
          toast(t('onboarding.checklistReset'), { 
            icon: '⚠️',
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
           console.error('❌ Refresh failed', e);
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
    >
      {renderCurrentStep()}
    </OnboardingLayout>
  )
}