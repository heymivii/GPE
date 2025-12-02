import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { transportPricesByCountry } from '../../../data/transport-data';

// ==================== OUTILS TRANSPORT ====================

export function TransportCostTool({ countryName }: { countryName?: string }) {
  const [transportType, setTransportType] = useState<'car' | 'public'>('car');
  const [distance, setDistance] = useState('');
  const [fuelConsumption, setFuelConsumption] = useState('7'); // L/100km

  // Récupérer les données du pays sélectionné
  // countryName est en fait le slug (ex: 'royaume-uni', 'france')
  const countryKey = countryName || 'france';
  const countryData = transportPricesByCountry[countryKey] || transportPricesByCountry['france'];
  
  const fuelPrice = countryData.fuelPricePerLiter;
  const publicTransportCost = countryData.publicTransportMonthly;
  
  // Formater le nom du pays pour l'affichage
  const displayName = countryName 
    ? countryName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    : undefined;

  const calculateCost = () => {
    if (transportType === 'public') return publicTransportCost;
    
    const dist = parseFloat(distance);
    if (isNaN(dist)) return 0;
    
    const consumption = parseFloat(fuelConsumption);
    const monthlyKm = dist * 2 * 22; // Aller-retour, 22 jours/mois
    const fuelCost = (monthlyKm / 100) * consumption * fuelPrice;
    return Math.round(fuelCost);
  };

  const monthlyCost = calculateCost();

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-900 mb-1">
          Calculateur transport {displayName && `- ${displayName}`}
        </h4>
        <p className="text-xs text-gray-500">
          Comparez le coût voiture vs transports en commun
        </p>
      </div>

      <div className="space-y-4">
        {/* Type de transport */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
            Type de transport
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTransportType('car')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                transportType === 'car'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              🚗 Voiture
            </button>
            <button
              onClick={() => setTransportType('public')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                transportType === 'public'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              🚇 Transports publics
            </button>
          </div>
        </div>

        {/* Distance (seulement pour voiture) */}
        {transportType === 'car' && (
          <>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                Distance domicile-travail (km)
              </label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Ex: 15"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-0 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                Consommation (L/100km)
              </label>
              <input
                type="number"
                value={fuelConsumption}
                onChange={(e) => setFuelConsumption(e.target.value)}
                step="0.1"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-0 text-sm"
              />
            </div>
          </>
        )}

        {/* Résultat */}
        <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
          <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Coût mensuel estimé</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              {monthlyCost > 0 ? monthlyCost : '---'}
            </span>
            <span className="text-lg font-medium text-gray-400">€</span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-white border border-gray-200">
          <div className="flex-shrink-0 w-4 h-4 mt-0.5 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-[10px]">i</div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Prix essence: {fuelPrice.toFixed(2)}€/L • Abonnement transport: {Math.round(publicTransportCost)}€/mois
            {displayName && ` • Données ${displayName}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DriverLicenseTool({ countryName }: { countryName?: string }) {
  const [originCountry, setOriginCountry] = useState('');

  // TODO: Utiliser driverLicenseRules depuis transport-data.ts
  const canExchange = originCountry !== '';
  
  return (
    <div>
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-900 mb-1">
          Permis de conduire {countryName && `- ${countryName}`}
        </h4>
        <p className="text-xs text-gray-500">
          Vérifiez les démarches nécessaires
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
            Pays d'origine de votre permis
          </label>
          <select
            value={originCountry}
            onChange={(e) => setOriginCountry(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-0 text-sm"
          >
            <option value="">Sélectionnez un pays</option>
            <option value="france">🇫🇷 France</option>
            <option value="canada">🇨🇦 Canada</option>
            <option value="usa">🇺🇸 États-Unis</option>
            <option value="uk">🇬🇧 Royaume-Uni</option>
            {/* TODO: Ajouter tous les pays */}
          </select>
        </div>

        {canExchange && (
          <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Échange possible</p>
                <p className="text-xs text-gray-500 mt-1">
                  Vous pouvez échanger votre permis {originCountry} sans repasser les examens.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Délai de traitement</span>
                <span className="font-medium text-gray-900">4-6 semaines</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Validité temporaire</span>
                <span className="font-medium text-gray-900">12 mois</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Permis international</span>
                <span className="font-medium text-green-600">✓ Accepté</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
              <div className="flex-shrink-0 w-4 h-4 mt-0.5 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-[10px]">!</div>
              <p className="text-[10px] text-gray-600 leading-relaxed">
                TODO: Compléter avec les vraies règles d'échange par pays dans transport-data.ts
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function VehicleChecklistTool() {
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Pièce d\'identité valide', checked: false },
    { id: 2, text: 'Justificatif de domicile', checked: false },
    { id: 3, text: 'Permis de conduire valide', checked: false },
    { id: 4, text: 'Preuve d\'assurance automobile', checked: false },
    { id: 5, text: 'Certificat d\'immatriculation', checked: false },
    { id: 6, text: 'Contrôle technique (si occasion)', checked: false },
  ]);

  const toggleItem = (id: number) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const progress = Math.round((checklist.filter(c => c.checked).length / checklist.length) * 100);

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-900 mb-1">
          Achat de véhicule
        </h4>
        <p className="text-xs text-gray-500">
          Documents nécessaires pour l'achat
        </p>
      </div>

      <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Préparation</span>
          <span className="text-lg font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gray-900 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-2">
        {checklist.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left group ${
              item.checked 
                ? 'bg-white border-gray-200 text-gray-400' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-700'
            }`}
          >
            <div className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              item.checked 
                ? 'bg-gray-900 border-gray-900 text-white' 
                : 'bg-white border-gray-300 text-transparent group-hover:border-gray-400'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <span className={`text-xs font-medium ${item.checked ? 'line-through' : ''}`}>
              {item.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
