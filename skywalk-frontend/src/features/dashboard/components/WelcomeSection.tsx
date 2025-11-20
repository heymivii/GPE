import { CheckCircle, Clock, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react'

interface WelcomeSectionProps {
  isProfileComplete?: boolean
  onStartProject?: () => void
}

export default function WelcomeSection({ 
  isProfileComplete = false, 
  onStartProject 
}: WelcomeSectionProps) {
  return (
    <section className="bg-white py-12 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Colonne Gauche : Titre et Intro */}
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Bienvenue sur Skywalk
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Préparez votre expatriation <br/>
              <span className="text-blue-600">en toute sérénité</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Pour vous accompagner au mieux, nous avons besoin de connaître votre projet. 
              Un profil complet nous permet de vous proposer des recommandations sur mesure.
            </p>

            {!isProfileComplete && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8 flex items-start">
                <div className="bg-orange-100 p-2 rounded-lg mr-4">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-orange-900">Profil incomplet</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Complétez votre profil pour débloquer toutes les fonctionnalités personnalisées.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={onStartProject}
              className="group inline-flex items-center px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <span>Lancer mon aventure</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Colonne Droite : Carte Avantages */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-purple-50 rounded-2xl transform rotate-3 scale-105 -z-10"></div>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Pourquoi compléter votre profil ?
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-100 transition-colors">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Recommandations ciblées</h4>
                    <p className="text-sm text-gray-500 mt-1">Des conseils adaptés à votre destination et votre situation.</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Checklists personnalisées</h4>
                    <p className="text-sm text-gray-500 mt-1">Ne manquez aucune étape administrative importante.</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-100 transition-colors">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Gain de temps précieux</h4>
                    <p className="text-sm text-gray-500 mt-1">Accédez directement aux informations qui vous concernent.</p>
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