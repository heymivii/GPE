import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCurrency, DISPLAY_CURRENCIES } from '../contexts/CurrencyContext';

/**
 * Compact dropdown to pick the display currency.
 * Can be placed in NavBar, dashboard, or any page header.
 */
export default function CurrencySelector() {
  const { displayCurrency, setDisplayCurrency, displaySymbol } = useCurrency();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 bg-white border rounded-lg text-sm font-medium transition-all shadow-sm ${
          isOpen ? 'border-gray-900 ring-2 ring-gray-100' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className="text-base">{displaySymbol}</span>
        <span className="text-gray-700">{displayCurrency}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-1.5 right-0 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-1.5">
              {DISPLAY_CURRENCIES.map((cur) => (
                <button
                  key={cur.code}
                  onClick={() => {
                    setDisplayCurrency(cur.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    displayCurrency === cur.code
                      ? 'bg-gray-900 text-white'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium w-6 text-center">{cur.symbol}</span>
                    <span>{cur.code}</span>
                    <span className={`text-xs ${displayCurrency === cur.code ? 'text-gray-300' : 'text-gray-400'}`}>
                      {t(cur.nameKey)}
                    </span>
                  </div>
                  {displayCurrency === cur.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
