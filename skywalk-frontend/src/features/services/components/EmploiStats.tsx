import { Briefcase, DollarSign, TrendingUp, Users } from 'lucide-react';
import { emploiDataByCountry } from '../../../data/emploi-data';

interface EmploiStatsProps {
  countryName?: string;
}

export default function EmploiStats({ countryName }: EmploiStatsProps) {
  const countryKey = countryName || 'france';
  
  // Données officielles depuis emploi-data.ts
  const data = emploiDataByCountry[countryKey] || emploiDataByCountry['france'];
  
  // Formater le nom du pays
  const displayName = countryName 
    ? countryName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    : 'France';
  
  // Couleur selon taux de chômage
  const getUnemploymentColor = () => {
    if (data.unemploymentRate < 3) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
    if (data.unemploymentRate < 5) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    if (data.unemploymentRate < 7) return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
    return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
  };
  
  const unemploymentColors = getUnemploymentColor();

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Chiffres clés {displayName && `- ${displayName}`}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Taux de chômage */}
        <div className={`rounded-xl p-6 border transition-all hover:shadow-sm ${unemploymentColors.bg} ${unemploymentColors.border}`}>
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className={`w-5 h-5 ${unemploymentColors.text}`} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Taux de chômage
          </p>
          <p className={`text-3xl font-bold tracking-tight mb-1 ${unemploymentColors.text}`}>
            {data.unemploymentRate}%
          </p>
          <p className="text-xs text-gray-500">
            2025
          </p>
        </div>

        {/* Salaire moyen */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Salaire moyen
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {data.avgSalaryNet}€
          </p>
          <p className="text-xs text-gray-500">
            Net par mois
          </p>
        </div>

        {/* Salaire minimum */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Salaire minimum
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {data.minWageNet}€
          </p>
          <p className="text-xs text-gray-500">
            {countryKey === 'france' ? 'SMIC net' : countryKey === 'royaume-uni' ? 'National Living Wage' : 'Salaire minimum'}
          </p>
        </div>

        {/* Heures de travail */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Heures légales
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {data.workingHours}h
          </p>
          <p className="text-xs text-gray-500">
            Par semaine
          </p>
        </div>
      </div>

      {/* Info par pays */}
      {countryKey === 'suisse' && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Briefcase className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">
                Marché du travail suisse
              </h3>
              <p className="text-sm text-green-800 leading-relaxed">
                Taux de chômage très bas ({data.unemploymentRate}%). Salaires élevés mais coût de la vie important. 
                Permis de travail nécessaire (permis B, L ou G selon situation). 
                Candidatures en allemand, français ou italien selon canton.
              </p>
            </div>
          </div>
        </div>
      )}

      {countryKey === 'royaume-uni' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Marché du travail britannique
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Marché dynamique (chômage {data.unemploymentRate}%). Skilled Worker visa requis pour la majorité des postes qualifiés. 
                CV format anglo-saxon (pas de photo, max 2 pages). National Living Wage : {data.minWageNet}€/mois.
              </p>
            </div>
          </div>
        </div>
      )}

      {countryKey === 'france' && (
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Briefcase className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-indigo-900 mb-1">
                Marché du travail français
              </h3>
              <p className="text-sm text-indigo-800 leading-relaxed">
                35h légales hebdomadaires. SMIC : {data.minWageNet}€ net/mois. 
                CV + lettre de motivation obligatoires. Forte protection des salariés (CDI, CDD). 
                Pôle Emploi pour accompagnement recherche d'emploi.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
