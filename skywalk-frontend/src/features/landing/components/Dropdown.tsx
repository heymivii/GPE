import { useState } from 'react';
import { ChevronDown, Home, Plane, Star, CheckCircle, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { countryApi } from '../../../api/country';
import { SUPPORTED_COUNTRY_NAMES } from '../../../data/supportedCountries';

export default function Dropdown() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    origin: 'France',
    destination: '',
    category: 'emploi',
    position: ''
  });

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: countryApi.getAll
  });



  const countryOptions = countries
    .filter(c => SUPPORTED_COUNTRY_NAMES.includes(c.countryName))
    .map(c => ({ label: c.countryName, value: c.countryName }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const categoryOptions = [
    { value: 'emploi', label: t('landing.search.options.job'), disabled: false },
    { value: 'logement', label: t('landing.search.options.housing'), disabled: true },
    { value: 'transport', label: t('services.categories.transport.title'), disabled: true },
    { value: 'sante', label: t('landing.search.options.health'), disabled: true },
  ];

  const [activeField, setActiveField] = useState<string | null>(null);

  const handleFieldClick = (field: string) => {
    setActiveField(activeField === field ? null : field);
  };

  const handleSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setActiveField(null);
  };

  const handleSearch = () => {

    const params = new URLSearchParams();

    if (formData.destination) {
      params.append('country', formData.destination);
    }

    if (formData.category) {
      params.append('category', formData.category);
    }

    if (formData.position) {
      params.append('query', formData.position);
    }

    const url = `/search?${params.toString()}`;

    navigate(url);
  };

  const SelectField = ({
    icon: Icon,
    label,
    value,
    field,
    options = [],
    isHighlighted = false
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    field: string;
    options?: { label: string; value: string; disabled?: boolean; requiresAuth?: boolean }[];
    isHighlighted?: boolean;
  }) => {
    const selectedOption = options.find(opt => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : value;
    const isEmpty = !value;

    return (
      <div className="relative w-full">
        <div
          className={`flex items-center space-x-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${isHighlighted
            ? 'border-brand/30 bg-brand-ink/5'
            : 'border-gray-200 hover:border-gray-300'
            } ${activeField === field ? 'ring-2 ring-brand ring-opacity-50' : ''}`}
          onClick={() => handleFieldClick(field)}
        >
          <div className="flex-shrink-0">
            <Icon className={`w-6 h-6 ${isHighlighted ? 'text-brand-ink' : 'text-gray-700'}`} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">{label}</div>
            <div className={`text-base font-medium ${isEmpty ? 'text-gray-400' : isHighlighted ? 'text-brand-ink' : 'text-gray-900'}`}>
              {isEmpty ? t('common.select') : displayValue}
            </div>
          </div>
          <div className="flex-shrink-0">
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${activeField === field ? 'rotate-180' : ''
              }`} />
          </div>
        </div>

        {activeField === field && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
            {options.length > 0 ? (
              <div className="py-2">
                {options.map((option) => (
                  <div
                    key={option.value}
                    className={`px-4 py-2 text-gray-700 ${option.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-gray-50 cursor-pointer'
                      } ${value === option.value ? 'bg-gray-50 font-medium' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!option.disabled) {
                        handleSelect(field, option.value);
                      }
                    }}
                  >
                    {option.label}
                    {option.disabled && (
                      <span className="ml-2 text-xs text-gray-500 italic">
                        {t('common.comingSoon')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 p-4 text-center">
                {t('common.noOptions')}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className=" sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">

            <SelectField
              icon={Home}
              label={t('landing.search.origin')}
              value={formData.origin}
              field="origin"
              options={countryOptions}
            />

            <SelectField
              icon={Plane}
              label={t('landing.search.destination')}
              value={formData.destination}
              field="destination"
              options={countryOptions}
            />

            <SelectField
              icon={Star}
              label={t('landing.search.category')}
              value={formData.category}
              field="category"
              options={categoryOptions}
            />

            <SelectField
              icon={CheckCircle}
              label={t('landing.search.position')}
              value={formData.position}
              field="position"
              isHighlighted={true}
              options={[
                { value: 'developer', label: t('landing.search.positions.developer') },
                { value: 'designer', label: t('landing.search.positions.designer') },
                { value: 'manager', label: t('landing.search.positions.manager') },
                { value: 'sales', label: t('landing.search.positions.sales') },
                { value: 'other', label: t('landing.search.positions.other') }
              ]}
            />

            <div className="pt-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="w-full bg-black text-white py-4 px-6 rounded-full font-medium text-lg hover:bg-gray-800 active:scale-95 transition-all duration-200 flex items-center justify-center space-x-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <Search className="w-5 h-5" />
                <span>{t('landing.search.button')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}