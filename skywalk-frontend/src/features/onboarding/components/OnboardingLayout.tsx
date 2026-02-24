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
    <div className="bg-neutral-100 min-h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <Stepper steps={steps} onStepClick={onStepClick} />
      </div>

      <main className="flex-1 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="mb-4 sm:mb-6 px-2 sm:px-0 flex items-center justify-between">
            <Breadcrumbs items={breadcrumbItems} />
            {/* Added a mobile-friendly explicit Back/Dashboard button */}
            <a href={isAuthenticated ? '/dashboard' : '/'} className="sm:hidden text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 ml-2 shrink-0">
              Quitter
            </a>
          </div>
          <div className="rounded-2xl bg-neutral-50 p-4 sm:p-6 md:p-8 shadow-sm">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}