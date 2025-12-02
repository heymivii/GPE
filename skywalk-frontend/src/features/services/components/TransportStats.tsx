import { Car, Bus, DollarSign, Fuel } from 'lucide-react';
import { transportPricesByCountry } from '../../../data/transport-data';

interface TransportStatsProps {
  countryName?: string;
}

export default function TransportStats({ countryName }: TransportStatsProps) {
  const countryKey = countryName || 'france';
  
  // Récupérer les données du pays
  const countryData = transportPricesByCountry[countryKey] || transportPricesByCountry['france'];
  
  // Formater le nom du pays
  const displayName = countryName 
    ? countryName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    : 'France';
  
  // Calculer un budget mensuel moyen voiture (100km/semaine)
  const avgMonthlyCarBudget = Math.round(
    (100 * 4.33 * countryData.fuelPricePerLiter * 7) / 100 + // Essence (7L/100km)
    (countryData.vehicleInsuranceYearly || 0) / 12 + // Assurance
    ((countryData.parkingMonthly || 0) * 0.5) // Parking partiel
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Chiffres clés {displayName && `- ${displayName}`}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Prix essence */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Fuel className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Prix essence
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {countryData.fuelPricePerLiter}€
          </p>
          <p className="text-xs text-gray-500">
            Par litre
          </p>
        </div>

        {/* Transport public */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Bus className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Pass mensuel
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {countryData.publicTransportMonthly}€
          </p>
          <p className="text-xs text-gray-500">
            {countryKey === 'france' && 'Navigo zones 1-5'}
            {countryKey === 'royaume-uni' && 'Travelcard zones 1-6'}
            {countryKey === 'suisse' && 'Zurich centre'}
          </p>
        </div>

        {/* Assurance auto */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Car className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Assurance auto
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {Math.round((countryData.vehicleInsuranceYearly || 0) / 12)}€
          </p>
          <p className="text-xs text-gray-500">
            Par mois (~{countryData.vehicleInsuranceYearly}€/an)
          </p>
        </div>

        {/* Budget mensuel voiture */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Budget auto mensuel
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            ~{avgMonthlyCarBudget}€
          </p>
          <p className="text-xs text-gray-500">
            Estimation 100km/semaine
          </p>
        </div>
      </div>

      {/* Info par pays */}
      {countryKey === 'suisse' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Car className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Transports en Suisse
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                La Suisse dispose d'un excellent réseau de transports publics. 
                Le prix de l'essence est similaire à la France (~{countryData.fuelPricePerLiter}€/L). 
                Parking en centre-ville : ~{countryData.parkingMonthly}€/mois.
              </p>
            </div>
          </div>
        </div>
      )}

      {countryKey === 'royaume-uni' && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Car className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                Transports au Royaume-Uni
              </h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                Conduite à gauche. Londres : Congestion Charge de £15/jour dans le centre. 
                Travelcard zones 1-6 : {countryData.publicTransportMonthly}€/mois. 
                Contrôle technique (MOT) obligatoire dès 3 ans.
              </p>
            </div>
          </div>
        </div>
      )}

      {countryKey === 'france' && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Bus className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-emerald-900 mb-1">
                Transports en France
              </h3>
              <p className="text-sm text-emerald-800 leading-relaxed">
                Forfait Navigo Île-de-France : {countryData.publicTransportMonthly}€/mois zones 1-5. 
                Essence SP95-E10 : {countryData.fuelPricePerLiter}€/L. 
                Contrôle technique obligatoire dès 4 ans, puis tous les 2 ans.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
