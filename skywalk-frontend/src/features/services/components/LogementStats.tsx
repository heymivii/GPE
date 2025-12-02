import { Home, DollarSign, TrendingUp, MapPin } from 'lucide-react';
import { logementPricesByCountry, cityRentPrices } from '../../../data/logement-data';

interface LogementStatsProps {
  countryName?: string;
}

export default function LogementStats({ countryName }: LogementStatsProps) {
  const countryKey = countryName || 'france';
  
  // Données officielles depuis logement-data.ts
  const data = logementPricesByCountry[countryKey] || logementPricesByCountry['france'];
  const cities = cityRentPrices[countryKey] || [];
  
  // Formater le nom du pays
  const displayName = countryName 
    ? countryName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    : 'France';

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Chiffres clés {displayName && `- ${displayName}`}
        </h2>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-100 rounded-full">
          <span className="text-xs font-medium text-amber-700">Estimations indicatives</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Loyer studio */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Home className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Loyer studio
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {data.avgRentStudio}€
          </p>
          <p className="text-xs text-gray-500">
            Par mois (moyenne nationale)
          </p>
        </div>

        {/* Loyer 2 pièces */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Home className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Loyer 2 pièces
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {data.avgRent2Rooms}€
          </p>
          <p className="text-xs text-gray-500">
            Par mois (moyenne nationale)
          </p>
        </div>

        {/* Dépôt de garantie */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Dépôt de garantie
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {data.depositMonths} mois
          </p>
          <p className="text-xs text-gray-500">
            De loyer
          </p>
        </div>

        {/* Charges mensuelles */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Charges moyennes
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            ~{data.utilitiesAvg}€
          </p>
          <p className="text-xs text-gray-500">
            Électricité, eau, internet
          </p>
        </div>
      </div>

      {/* Info sur les prix par ville */}
      {cities.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">
                Prix par ville principale
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {cities.slice(0, 6).map((city) => (
                  <div key={city.name} className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="font-semibold text-blue-900 mb-1">{city.name}</p>
                    <p className="text-xs text-gray-600">Studio: {city.studio}€</p>
                    <p className="text-xs text-gray-600">T2: {city.t2}€</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note importante */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-5">
        <p className="text-sm text-gray-700 leading-relaxed">
          <strong>Note :</strong> Les prix varient selon la ville, le quartier, l'état du logement et la proximité des transports. 
          {countryKey === 'france' && ' À Paris, Lyon et Lille : encadrement des loyers applicable (loyer de référence).'}
          {countryKey === 'royaume-uni' && ' À Londres : Council Tax non inclus (£100-200/mois selon zone).'}
          {countryKey === 'suisse' && ' Zurich et Genève sont les villes les plus chères. Dépôt généralement 3 mois.'}
        </p>
      </div>
    </section>
  );
}
