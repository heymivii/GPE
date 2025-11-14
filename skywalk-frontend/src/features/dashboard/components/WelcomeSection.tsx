import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'

interface WelcomeSectionProps {
  isProfileComplete?: boolean
  onStartProject?: () => void
}

export default function WelcomeSection({ 
  isProfileComplete = false, 
  onStartProject 
}: WelcomeSectionProps) {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre principal */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue sur Skywalk !
          </h1>
          <p className="text-md text-gray-600 max-w-2xl">
            Pour qu'on vous accompagne au mieux, dites-nous quelques infos sur votre projet.
          </p>
        </div>

        {/* Encadré gris avec informations */}
        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          {/* Texte d'accroche avec icône */}
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0 mr-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-1">
                Préparez et optimisez chaque étape de votre projet d'expatriation.
              </h3>
              <p className='font-light text-xs'>Un profil bien défini, c’est un accompagnement sur mesure.</p>
            </div>
          </div>

          {/* Liste des avantages */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">Infos adaptées</h4>
                <p className="text-sm text-gray-600">Conseils personnalisés selon votre destination</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">Suggestions personnalisées</h4>
                <p className="text-sm text-gray-600">Recommandations basées sur votre profil</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">Gain de temps</h4>
                <p className="text-sm text-gray-600">Toutes les infos essentielles en un lieu</p>
              </div>
            </div>
          </div>

          {/* Alerte profil incomplet */}
          {!isProfileComplete && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-orange-800">Profil incomplet</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Complétez votre profil pour recevoir des recommandations personnalisées
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bouton CTA */}
          <div className="text-center">
            <button
              onClick={onStartProject}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center"
            >
              <span>Lancer mon aventure avec Skywalk</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}