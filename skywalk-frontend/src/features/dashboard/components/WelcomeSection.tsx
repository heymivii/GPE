import { CheckCircle, Clock, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface WelcomeSectionProps {
  isProfileComplete?: boolean
  onStartProject?: () => void
}

export default function WelcomeSection({ 
  isProfileComplete = false, 
  onStartProject 
}: WelcomeSectionProps) {
  const { t } = useTranslation();
  return (
    <section className="bg-white py-16 border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium mb-8 font-outfit">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('welcome.badge')}
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight font-outfit tracking-tight">
              {t('welcome.title')} <br/>
              <span className="text-gray-400 font-light">{t('welcome.titleHighlight')}</span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed font-light max-w-lg">
              {t('welcome.description')}
            </p>

            {!isProfileComplete && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-10 flex items-start">
                <div className="bg-white p-2.5 rounded-xl border border-gray-100 mr-5 shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 font-outfit">{t('welcome.profileIncomplete')}</h4>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {t('welcome.profileIncompleteDesc')}
                  </p>
                  {/* Retour de recette : le message constatait le problème sans
                      donner le moyen de le régler. `?edit=1` ouvre directement
                      le formulaire, pas la fiche en lecture seule. */}
                  <Link
                    to="/profile?edit=1"
                    className="group inline-flex items-center mt-3 text-sm font-semibold text-gray-900 hover:text-black"
                  >
                    {t('welcome.completeProfileCta')}
                    <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            )}

            <button
              onClick={onStartProject}
              className="group inline-flex items-center px-8 py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-black transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 font-outfit"
            >
              <span>{t('welcome.startAdventure')}</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gray-50 rounded-[2rem] transform rotate-2 scale-105 -z-10 opacity-50"></div>
            
            <div className="bg-white border border-gray-100 rounded-[2rem] p-10 shadow-2xl shadow-gray-100/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 font-outfit">
                {t('welcome.whyComplete')}
              </h3>
              
              <div className="space-y-8">
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-gray-100 transition-colors duration-300 border border-gray-100">
                    <CheckCircle className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 font-outfit text-lg">{t('welcome.targetedRecs')}</h4>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{t('welcome.targetedRecsDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-gray-100 transition-colors duration-300 border border-gray-100">
                    <CheckCircle className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 font-outfit text-lg">{t('welcome.personalizedChecklists')}</h4>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{t('welcome.personalizedChecklistsDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-gray-100 transition-colors duration-300 border border-gray-100">
                    <Clock className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 font-outfit text-lg">{t('welcome.timeSaving')}</h4>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{t('welcome.timeSavingDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}