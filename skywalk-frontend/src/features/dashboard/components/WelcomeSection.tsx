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
    <section className="bg-white py-16 border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium mb-8 font-outfit">
              <Sparkles className="w-4 h-4 mr-2" />
              Bienvenue sur Skywalk
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight font-outfit tracking-tight">
              Préparez votre expatriation <br/>
              <span className="text-gray-400 font-light">en toute sérénité</span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed font-light max-w-lg">
              Pour vous accompagner au mieux, nous avons besoin de connaître votre projet. 
              Un profil complet nous permet de vous proposer des recommandations sur mesure.
            </p>

            {!isProfileComplete && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-10 flex items-start">
                <div className="bg-white p-2.5 rounded-xl border border-gray-100 mr-5 shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 font-outfit">Profil incomplet</h4>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    Complétez votre profil pour débloquer toutes les fonctionnalités personnalisées.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={onStartProject}
              className="group inline-flex items-center px-8 py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-black transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 font-outfit"
            >
              <span>Lancer mon aventure</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          <div className="relative">
            {/* Decorative subtle background */}
            <div className="absolute inset-0 bg-gray-50 rounded-[2rem] transform rotate-2 scale-105 -z-10 opacity-50"></div>
            
            <div className="bg-white border border-gray-100 rounded-[2rem] p-10 shadow-2xl shadow-gray-100/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 font-outfit">
                Pourquoi compléter votre profil ?
              </h3>
              
              <div className="space-y-8">
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-gray-100 transition-colors duration-300 border border-gray-100">
                    <CheckCircle className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 font-outfit text-lg">Recommandations ciblées</h4>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">Des conseils adaptés à votre destination et votre situation.</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-gray-100 transition-colors duration-300 border border-gray-100">
                    <CheckCircle className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 font-outfit text-lg">Checklists personnalisées</h4>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">Ne manquez aucune étape administrative importante.</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-gray-100 transition-colors duration-300 border border-gray-100">
                    <Clock className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 font-outfit text-lg">Gain de temps précieux</h4>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">Accédez directement aux informations qui vous concernent.</p>
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