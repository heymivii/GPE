import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Trophy, Sparkles, Maximize2, Minimize2, FileText, Calculator, Car, Heart } from 'lucide-react';
import { TransportCostTool } from './TransportTools';
import { HealthCoverageTool } from './HealthTools';

interface ServiceToolsProps {
  category: string;
  countryName?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function ServiceTools({ category, countryName, isExpanded = false, onToggleExpand }: ServiceToolsProps) {
  const { t } = useTranslation();
  const [activeTool, setActiveTool] = useState<string>('default');

  if (category === 'emploi') {
    const currentTool = activeTool === 'default' ? 'cv' : activeTool;
    return (
      <ToolContainer 
        title={t('services.tools.title')} 
        description={t('services.tools.cvAnalyzer.description')}
        activeToolId={currentTool}
        onToolChange={setActiveTool}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        tools={[
          { id: 'cv', label: t('services.tools.cvAnalyzer.title'), icon: FileText, active: true },
        ]}
      >
        {currentTool === 'cv' && <CVReadinessTool countryName={countryName} />}
      </ToolContainer>
    );
  }
  
  if (category === 'logement') {
    const currentTool = activeTool === 'default' ? 'calc' : activeTool;
    return (
      <ToolContainer 
        title={t('services.tools.title')} 
        description={t('services.tools.budgetCalculator.description')}
        activeToolId={currentTool}
        onToolChange={setActiveTool}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        tools={[
          { id: 'calc', label: t('services.tools.budgetCalculator.title'), icon: Calculator, active: true },
        ]}
      >
        {currentTool === 'calc' && <RentCalculatorTool countryName={countryName} />}
      </ToolContainer>
    );
  }

  if (category === 'transport') {
    const currentTool = activeTool === 'default' ? 'cost' : activeTool;
    return (
      <ToolContainer 
        title={t('services.tools.title')} 
        description={t('services.tools.transportCost.description')}
        activeToolId={currentTool}
        onToolChange={setActiveTool}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        tools={[
          { id: 'cost', label: t('services.tools.transportCost.title'), icon: Car, active: true },
        ]}
      >
        {currentTool === 'cost' && <TransportCostTool countryName={countryName} />}
      </ToolContainer>
    );
  }

  if (category === 'sante') {
    const currentTool = activeTool === 'default' ? 'coverage' : activeTool;
    return (
      <ToolContainer 
        title={t('services.tools.title')} 
        description={t('services.tools.healthCoverage.description')}
        activeToolId={currentTool}
        onToolChange={setActiveTool}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        tools={[
          { id: 'coverage', label: t('services.tools.healthCoverage.title'), icon: Heart, active: true },
        ]}
      >
        {currentTool === 'coverage' && <HealthCoverageTool countryName={countryName} />}
      </ToolContainer>
    );
  }

  return null;
}

interface ToolContainerProps {
  title: string;
  description: string;
  tools: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }>; active: boolean; comingSoon?: boolean }>;
  activeToolId: string;
  onToolChange: (id: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  children: React.ReactNode;
}

function ToolContainer({ title, description, tools, activeToolId, onToolChange, isExpanded, onToggleExpand, children }: ToolContainerProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
          </div>
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title={isExpanded ? t('common.reduce', 'Réduire') : t('common.expand', 'Agrandir')}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4 text-gray-600" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </div>

      {/* Navigation */}
      <div className="px-4 py-3 space-y-1 border-b border-gray-100">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => tool.active && onToolChange(tool.id)}
            disabled={!tool.active}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
              activeToolId === tool.id
                ? 'bg-gray-900 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } ${!tool.active && 'opacity-50 cursor-not-allowed'}`}
          >
            <tool.icon className={`w-4 h-4 ${activeToolId === tool.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
            <span className="flex-1 text-left">{tool.label}</span>
            {tool.comingSoon && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">
                {t('common.comingSoon')}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        {children}
      </div>
    </div>
  );
}

function CVReadinessTool({ countryName }: { countryName?: string }) {
  const { t } = useTranslation();
  const [checklist, setChecklist] = useState([
    { id: 1, text: t('services.tools.cvReadiness.items.translated'), checked: false },
    { id: 2, text: t('services.tools.cvReadiness.items.highlighted'), checked: false },
    { id: 3, text: t('services.tools.cvReadiness.items.contact'), checked: false },
    { id: 4, text: t('services.tools.cvReadiness.items.linkedin'), checked: false },
    { id: 5, text: t('services.tools.cvReadiness.items.format'), checked: false },
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
          {t('services.tools.cvReadiness.title')} {countryName && `- ${countryName}`}
        </h4>
        <p className="text-xs text-gray-500">
          {t('services.tools.cvReadiness.description')}
        </p>
      </div>

      <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('services.tools.cvReadiness.progress')}</span>
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

      {progress === 100 && (
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg flex items-center gap-3">
          <Trophy className="w-4 h-4 text-gray-900 flex-shrink-0" />
          <p className="text-xs font-medium text-gray-700">{t('services.tools.cvReadiness.ready')}</p>
        </div>
      )}
    </div>
  );
}

function RentCalculatorTool({ countryName }: { countryName?: string }) {
  const { t } = useTranslation();
  const [salary, setSalary] = useState<string>('');
  const [period, setPeriod] = useState<'month' | 'year'>('month');

  const calculateBudget = () => {
    const numSalary = parseFloat(salary);
    if (isNaN(numSalary)) return 0;
    const monthlySalary = period === 'year' ? numSalary / 12 : numSalary;
    return Math.round(monthlySalary * 0.33); // 33% rule
  };

  const budget = calculateBudget();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h4 className="text-xl font-bold text-gray-900 mb-2">
          {t('services.tools.rentCalculator.title')}
        </h4>
        <p className="text-gray-500 text-sm">
          {t('services.tools.rentCalculator.description')}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
            {t('services.tools.rentCalculator.netIncome')}
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Ex: 2500"
                className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400"
              />
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'month' | 'year')}
              className="px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 focus:border-gray-900 focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors text-sm"
            >
              <option value="month">{t('services.tools.rentCalculator.perMonth')}</option>
              <option value="year">{t('services.tools.rentCalculator.perYear')}</option>
            </select>
          </div>
        </div>

        <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200 text-center">
          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">{t('services.tools.rentCalculator.recommendedBudget')}</p>
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-4xl font-bold text-gray-900 tracking-tight">
              {budget > 0 ? budget : '---'}
            </span>
            <span className="text-xl font-medium text-gray-400">€</span>
          </div>
          <p className="text-sm text-gray-400">{t('services.tools.rentCalculator.maxPerMonth')}</p>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="flex-shrink-0 w-5 h-5 mt-0.5 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">i</div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {t('services.tools.rentCalculator.info')}
            {countryName && ` À ${countryName}, les propriétaires peuvent exiger des garanties supplémentaires.`}
          </p>
        </div>
      </div>
    </div>
  );
}

