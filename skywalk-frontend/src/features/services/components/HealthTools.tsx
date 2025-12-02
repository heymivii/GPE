import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { healthSystemByCountry, healthBudgetByProfile, healthBudgetByProfileSwitzerland } from '../../../data/health-data';

// ==================== OUTILS SANTÉ ====================

export function HealthCoverageTool({ countryName }: { countryName?: string }) {
  const [profile, setProfile] = useState<'employee' | 'self-employed' | 'student'>('employee');

  // Récupérer les données du pays sélectionné (countryName est le slug)
  const countryKey = countryName || 'france';
  const countryData = healthSystemByCountry[countryKey] || healthSystemByCountry['france'];
  
  const publicCost = countryData.publicCostMonthly || 0;
  const privateCost = countryData.privateCostMonthly || 50;
  
  // Formater le nom du pays pour l'affichage
  const displayName = countryName 
    ? countryName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    : undefined;

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-900 mb-1">
          Couverture santé {displayName && `- ${displayName}`}
        </h4>
        <p className="text-xs text-gray-500">
          Estimez vos besoins en assurance santé
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
            Votre situation
          </label>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value as typeof profile)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-0 text-sm"
          >
            <option value="employee">Salarié</option>
            <option value="self-employed">Indépendant</option>
            <option value="student">Étudiant</option>
          </select>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
          <div className="pb-3 border-b border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs font-bold text-gray-900">Couverture publique</p>
                <p className="text-xs text-gray-500">Sécurité sociale / système public</p>
              </div>
              <span className="text-lg font-bold text-gray-900">{publicCost}€</span>
            </div>
            <p className="text-[10px] text-gray-500">
              {publicCost === 0 ? 'Inclus dans cotisations sociales' : 'Cotisation mensuelle'}
            </p>
          </div>

          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs font-bold text-gray-900">Assurance complémentaire</p>
                <p className="text-xs text-gray-500">Mutuelle privée recommandée</p>
              </div>
              <span className="text-lg font-bold text-gray-900">{privateCost}€</span>
            </div>
            <p className="text-[10px] text-gray-500">Par mois</p>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-900">Total estimé</span>
              <span className="text-xl font-bold text-gray-900">{publicCost + privateCost}€/mois</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-white border border-gray-200">
          <div className="flex-shrink-0 w-4 h-4 mt-0.5 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-[10px]">i</div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            TODO: Compléter avec les vraies données par pays dans health-data.ts
          </p>
        </div>
      </div>
    </div>
  );
}

export function MedicalChecklistTool({ countryName }: { countryName?: string }) {
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Dossier médical complet traduit', checked: false },
    { id: 2, text: 'Carnet de vaccination à jour', checked: false },
    { id: 3, text: 'Ordonnances en cours traduites', checked: false },
    { id: 4, text: 'Carte européenne d\'assurance maladie (si UE)', checked: false },
    { id: 5, text: 'Attestation assurance santé internationale', checked: false },
    { id: 6, text: 'Liste allergies et conditions préexistantes', checked: false },
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
          Dossier médical {countryName && `- ${countryName}`}
        </h4>
        <p className="text-xs text-gray-500">
          Documents médicaux nécessaires
        </p>
      </div>

      <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Complétude</span>
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

export function HealthBudgetTool({ countryName }: { countryName?: string }) {
  const [profile, setProfile] = useState<'young' | 'adult' | 'senior'>('adult');

  // Utiliser les vraies données depuis health-data.ts
  const profileMap = {
    young: 'young_healthy',
    adult: 'adult_average',
    senior: 'senior',
  } as const;
  
  const budgetKey = profileMap[profile];
  
  // Utiliser les budgets spécifiques à la Suisse si le pays est 'suisse'
  const countryKey = countryName || 'france';
  const budget = countryKey === 'suisse' 
    ? healthBudgetByProfileSwitzerland[budgetKey] 
    : healthBudgetByProfile[budgetKey];
  
  // Calculer le total
  const total = budget.insurance + budget.consultations + budget.medications + 
                budget.dental + budget.optical + budget.emergency;
  
  // Formater le nom du pays pour l'affichage
  const displayName = countryName 
    ? countryName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    : undefined;

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-900 mb-1">
          Budget santé annuel {displayName && `- ${displayName}`}
        </h4>
        <p className="text-xs text-gray-500">
          Estimez vos dépenses santé
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
            Votre profil
          </label>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value as typeof profile)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-0 text-sm"
          >
            <option value="young">18-30 ans (bonne santé)</option>
            <option value="adult">30-60 ans (santé moyenne)</option>
            <option value="senior">60+ ans</option>
          </select>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Assurance annuelle</span>
            <span className="font-medium text-gray-900">{budget.insurance}€</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Consultations</span>
            <span className="font-medium text-gray-900">{budget.consultations}€</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Médicaments</span>
            <span className="font-medium text-gray-900">{budget.medications}€</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Dentaire</span>
            <span className="font-medium text-gray-900">{budget.dental}€</span>
          </div>
          
          <div className="pt-3 border-t border-gray-200 mt-3 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-900">Total estimé</span>
            <span className="text-xl font-bold text-gray-900">{total}€/an</span>
          </div>
        </div>

        {countryKey === 'suisse' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
            <div className="flex-shrink-0 w-4 h-4 mt-0.5 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-bold text-[10px]">!</div>
            <p className="text-[10px] text-orange-700 leading-relaxed">
              ⚠️ <strong>Suisse:</strong> Assurance maladie LAMal OBLIGATOIRE (prime moyenne 413€/mois). Coûts santé parmi les plus élevés d'Europe.
            </p>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-white border border-gray-200">
          <div className="flex-shrink-0 w-4 h-4 mt-0.5 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-[10px]">i</div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Budget moyen sans conditions préexistantes. Données officielles {displayName || 'France'} 2025.
          </p>
        </div>
      </div>
    </div>
  );
}
