import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { transportPricesByCountry } from '../../../data/transport-data';


export function TransportCostTool({ countryName }: { countryName?: string }) {
  const { t } = useTranslation();
  const [transportType, setTransportType] = useState<'car' | 'public'>('car');
  const [distance, setDistance] = useState('');
  const [fuelConsumption, setFuelConsumption] = useState('7'); // L/100km

  const countryKey = countryName || 'france';
  const countryData = transportPricesByCountry[countryKey] || transportPricesByCountry['france'];
  
  const fuelPrice = countryData.fuelPricePerLiter;
  const publicTransportCost = countryData.publicTransportMonthly;
  
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
          {t('services.tools.transportCost.title')} {displayName && `- ${displayName}`}
        </h4>
        <p className="text-xs text-gray-500">
          {t('services.tools.transportCost.description')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setTransportType('car')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              transportType === 'car' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('services.tools.transportCost.car')}
          </button>
          <button
            onClick={() => setTransportType('public')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              transportType === 'public' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('services.tools.transportCost.publicTransport')}
          </button>
        </div>

        {transportType === 'car' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('services.tools.transportCost.dailyDistance')}
              </label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Ex: 30"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-0 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('services.tools.transportCost.fuelConsumption')}
              </label>
              <input
                type="number"
                value={fuelConsumption}
                onChange={(e) => setFuelConsumption(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-0 text-sm"
              />
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">{t('services.tools.transportCost.fuelPrice')}</span>
                <span className="text-xs font-bold text-gray-900">{fuelPrice} €/L</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-2">{t('services.tools.transportCost.publicPass')}</p>
            <p className="text-2xl font-bold text-gray-900">{publicTransportCost} €</p>
            <p className="text-xs text-gray-400 mt-1">/ mois</p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900">{t('services.tools.transportCost.monthlyCost')}</span>
            <span className="text-xl font-bold text-gray-900">{monthlyCost} €</span>
          </div>
          {transportType === 'car' && (
            <p className="text-[10px] text-gray-400 mt-2 text-right">
              {t('services.tools.transportCost.info')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function DriverLicenseTool({ countryName }: { countryName?: string }) {
  const [originCountry, setOriginCountry] = useState('');

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
