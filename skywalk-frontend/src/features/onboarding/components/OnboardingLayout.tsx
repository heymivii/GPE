import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Stepper from './Stepper'
import type { Step } from './Stepper'
import { useAuth } from '../../../hooks/useAuth'
import Breadcrumbs from '../../../components/Breadcrumbs'

interface OnboardingLayoutProps {
  children: ReactNode
  steps: Step[]
  onStepClick?: (id: number) => void
  title?: string
}

export default function OnboardingLayout({ 
  children, 
  steps, 
  onStepClick,
}: OnboardingLayoutProps) {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()

  const currentStep = steps.find(s => s.state === 'current');
  
  const breadcrumbItems = [
    ...(isAuthenticated ? [{ label: t('onboarding.layout.dashboard'), path: '/dashboard' }] : []),
    { label: t('onboarding.layout.expatProject'), path: '/onboarding' },
    ...(currentStep ? [{ label: currentStep.label }] : [])
  ];

  return (
    <div className="bg-neutral-100">
      <div className="bg-white border-b border-gray-200">
        <Stepper steps={steps} onStepClick={onStepClick} />
      </div>

      <main className="flex-1 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <div className="rounded-2xl bg-neutral-50 p-6 md:p-8 shadow-sm">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}