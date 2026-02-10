import { Link } from 'react-router-dom'
import { Lock, CheckCircle, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AuthGateStepProps {
  age?: string
  onBack: () => void
}

export default function AuthGateStep({ age, onBack }: AuthGateStepProps) {
  const { t } = useTranslation()
  
  const benefits = [
    t('onboarding.authGate.benefit1'),
    t('onboarding.authGate.benefit2'),
    t('onboarding.authGate.benefit3'),
    t('onboarding.authGate.benefit4')
  ]

  const redirectPath = encodeURIComponent('/onboarding?save=true')
  const registerUrl = `/auth/register?redirect=${redirectPath}${age ? `&age=${age}` : ''}`
  const loginUrl = `/auth/login?redirect=${redirectPath}`

  return (
    <div className="max-w-2xl mx-auto text-center py-8">
      <div className="mb-8 flex justify-center">
        <div className="w-20 h-20 bg-[#5EA3C0]/10 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-[#5EA3C0]" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        {t('onboarding.authGate.title')}
      </h2>
      
      <p className="text-lg text-gray-600 mb-10">
        {t('onboarding.authGate.subtitle')}
      </p>

      <div className="bg-gray-50 rounded-2xl p-8 mb-10 text-left">
        <h3 className="font-bold text-gray-900 mb-4">{t('onboarding.authGate.benefitsTitle')}</h3>
        <div className="grid gap-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#5EA3C0] flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to={registerUrl}
          onClick={() => localStorage.setItem('skywalk-should-save', 'true')}
          className="inline-flex items-center justify-center px-8 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-gray-900/20"
        >
          {t('onboarding.authGate.createAccount')}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
        
        <Link
          to={loginUrl}
          onClick={() => localStorage.setItem('skywalk-should-save', 'true')}
          className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
        >
          {t('onboarding.authGate.hasAccount')}
        </Link>
      </div>

      <button
        onClick={onBack}
        className="mt-8 text-sm text-gray-500 hover:text-gray-900 underline"
      >
        {t('onboarding.authGate.goBack')}
      </button>
    </div>
  )
}
