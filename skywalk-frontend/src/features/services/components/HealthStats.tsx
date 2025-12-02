import { TrendingUp, DollarSign, Shield, AlertCircle } from 'lucide-react';
import { healthSystemByCountry, healthBudgetByProfile, healthBudgetByProfileSwitzerland } from '../../../data/health-data';

interface HealthStatsProps {
  countryName?: string;
}

export default function HealthStats({ countryName }: HealthStatsProps) {
  const countryKey = countryName || 'france';
  
  // Récupérer les données du pays
  const countryData = healthSystemByCountry[countryKey] || healthSystemByCountry['france'];
  
  // Utiliser les budgets appropriés selon le pays
  const budgets = countryKey === 'suisse' 
    ? healthBudgetByProfileSwitzerland 
    : healthBudgetByProfile;
  
  // Calculer les moyennes
  const avgYoungBudget = budgets.young_healthy.insurance + budgets.young_healthy.consultations + 
                         budgets.young_healthy.medications + budgets.young_healthy.dental + 
                         budgets.young_healthy.optical;
  
  const avgAdultBudget = budgets.adult_average.insurance + budgets.adult_average.consultations + 
                         budgets.adult_average.medications + budgets.adult_average.dental + 
                         budgets.adult_average.optical;
  
  const avgSeniorBudget = budgets.senior.insurance + budgets.senior.consultations + 
                          budgets.senior.medications + budgets.senior.dental + 
                          budgets.senior.optical;
  
  const avgBudget = Math.round((avgYoungBudget + avgAdultBudget + avgSeniorBudget) / 3);
  
  // Formater le nom du pays
  const displayName = countryName 
    ? countryName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    : 'France';
  
  // Déterminer le type de système
  const systemType = countryData.type === 'public' ? 'Public' : 
                     countryData.type === 'mixed' ? 'Mixte' : 'Privé';
  
  // Message personnalisé selon le pays
  const getSystemDescription = () => {
    if (countryKey === 'suisse') {
      return 'Assurance LAMal obligatoire';
    } else if (countryKey === 'royaume-uni') {
      return 'NHS gratuit via impôts';
    } else if (countryKey === 'france') {
      return 'Sécurité sociale + mutuelle';
    }
    return 'Système de santé local';
  };
  
  // Couleur de l'alerte selon le coût
  const getBudgetColor = () => {
    if (avgBudget > 6000) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
    if (avgBudget > 3000) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' };
    if (avgBudget > 1500) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' };
    return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' };
  };
  
  const budgetColors = getBudgetColor();

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Chiffres clés {displayName && `- ${displayName}`}
        </h2>
        {countryKey === 'suisse' && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-orange-100 rounded-full">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-700">Coûts élevés</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Type de système */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Type de système
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {systemType}
          </p>
          <p className="text-xs text-gray-500">
            {getSystemDescription()}
          </p>
        </div>

        {/* Coût mensuel public */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            {countryKey === 'suisse' ? 'Prime LAMal moyenne' : 'Coût public mensuel'}
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {countryData.publicCostMonthly}€
          </p>
          <p className="text-xs text-gray-500">
            {countryData.publicCostMonthly === 0 ? 'Via impôts' : 'Par mois'}
          </p>
        </div>

        {/* Budget santé annuel moyen */}
        <div className={`rounded-xl p-6 border transition-all hover:shadow-sm ${budgetColors.bg} ${budgetColors.border}`}>
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className={`w-5 h-5 ${budgetColors.text}`} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Budget annuel moyen
          </p>
          <p className={`text-3xl font-bold tracking-tight mb-1 ${budgetColors.text}`}>
            {avgBudget.toLocaleString()}€
          </p>
          <p className="text-xs text-gray-500">
            Tous profils confondus
          </p>
        </div>

        {/* Taux de remboursement */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Taux de remboursement
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {countryData.coPaymentRate}%
          </p>
          <p className="text-xs text-gray-500">
            Prise en charge moyenne
          </p>
        </div>
      </div>

      {/* Alertes spécifiques par pays */}
      {countryKey === 'suisse' && (
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900 mb-1">
                Système suisse unique
              </h3>
              <p className="text-sm text-orange-800 leading-relaxed">
                L'assurance maladie de base (LAMal) est <strong>OBLIGATOIRE</strong> pour tous les résidents. 
                Les primes sont parmi les plus élevées d'Europe ({countryData.publicCostMonthly}€/mois en moyenne). 
                Soins dentaires et optiques NON couverts par l'assurance de base.
              </p>
            </div>
          </div>
        </div>
      )}

      {countryKey === 'royaume-uni' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                NHS (National Health Service)
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Le NHS offre des soins gratuits au point de service pour les résidents. 
                Les détenteurs de visa long séjour doivent payer l'Immigration Health Surcharge (IHS) 
                d'environ £624/an lors de la demande de visa.
              </p>
            </div>
          </div>
        </div>
      )}

      {countryKey === 'france' && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">
                Sécurité sociale française
              </h3>
              <p className="text-sm text-green-800 leading-relaxed">
                La Sécurité sociale rembourse 70% des soins médicaux. 
                Une mutuelle complémentaire (~55€/mois) couvre le reste à charge. 
                Les affections de longue durée (ALD) sont prises en charge à 100%.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
