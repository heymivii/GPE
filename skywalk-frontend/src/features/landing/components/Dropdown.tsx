import { useState } from 'react';
import { ChevronDown, Home, Plane, Star, CheckCircle, Search } from 'lucide-react';

export default function JobSearchForm() {
  const [formData, setFormData] = useState({
    origin: 'France',
    destination: 'Bresil',
    category: 'Emploi',
    position: 'Développeur'
  });

  const [activeField, setActiveField] = useState<string | null>(null);

  const handleFieldClick = (field: string) => {
    setActiveField(activeField === field ? null : field);
  };

  const handleSearch = () => {
    console.log('Recherche avec:', formData);
    // Ici vous pouvez ajouter la logique de recherche
  };

  const SelectField = ({
    icon: Icon,
    label,
    value,
    field,
    isHighlighted = false
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    field: string;
    isHighlighted?: boolean;
  }) => (
    <div className="relative w-full min-w-[400px]">
      <div 
        className={`flex items-center space-x-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
          isHighlighted 
            ? 'border-blue-200 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        } ${activeField === field ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
        onClick={() => handleFieldClick(field)}
      >
        <div className="flex-shrink-0">
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500">{label}</div>
          <div className={`text-base font-medium ${
            isHighlighted ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {value}
          </div>
        </div>
        <div className="flex-shrink-0">
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            activeField === field ? 'rotate-180' : ''
          }`} />
        </div>
      </div>
      
      {/* Dropdown simulé (vous pouvez implémenter une vraie dropdown ici) */}
      {activeField === field && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-2">
          <div className="text-sm text-gray-500 p-2">
            Options pour {label.toLowerCase()}...
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            {/* D'où je viens */}
            <SelectField
              icon={Home}
              label="D'où je viens"
              value={formData.origin}
              field="origin"
            />

            {/* Où je vais */}
            <SelectField
              icon={Plane}
              label="Où je vais"
              value={formData.destination}
              field="destination"
            />

            {/* Catégorie de recherche */}
            <SelectField
              icon={Star}
              label="Catégorie de recherche"
              value={formData.category}
              field="category"
            />

            {/* Intitulé du poste */}
            <SelectField
              icon={CheckCircle}
              label="Intitulé du poste"
              value={formData.position}
              field="position"
              isHighlighted={true}
            />

            {/* Bouton de recherche */}
            <div className="pt-4">
              <button 
                onClick={handleSearch}
                className="w-full bg-black text-white py-4 px-6 rounded-full font-medium text-lg hover:bg-gray-800 active:scale-95 transition-all duration-200 flex items-center justify-center space-x-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <Search className="w-5 h-5" />
                <span>Rechercher</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage des données pour debug
      <div className="max-w-2xl mx-auto mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Données actuelles :</h3>
        <pre className="text-xs text-gray-600">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div> */}
    </div>
  );
}