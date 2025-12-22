import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Banknote } from "lucide-react";
import Widget from "./Widget";

interface CurrencyConverterWidgetProps {
  onHide?: () => void;
}

const CURRENCIES = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
];

const CurrencyConverterWidget: React.FC<CurrencyConverterWidgetProps> = ({
  onHide,
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>("100");
  const [fromCurrency, setFromCurrency] = useState<string>("EUR");
  const [toCurrency, setToCurrency] = useState<string>("USD");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  
  // Cache for exchange rates
  const rateCache = useRef<Record<string, { rate: number; timestamp: number }>>({});

  const API_KEY = import.meta.env.VITE_EXCHANGERATE_API_KEY;

  // Fetch exchange rate only when currencies change
  useEffect(() => {
    if (!API_KEY) {
      setError("API key not configured");
      return;
    }

    const fetchExchangeRate = async () => {
      const cacheKey = `${fromCurrency}-${toCurrency}`;
      const now = Date.now();
      const cached = rateCache.current[cacheKey];
      
      // Use cache if less than 1 hour old
      if (cached && now - cached.timestamp < 3600000) {
        setExchangeRate(cached.rate);
        const numAmount = parseFloat(amount) || 0;
        setResult(numAmount * cached.rate);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${fromCurrency}/${toCurrency}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch exchange rate");
        }

        const data = await response.json();

        if (data.result === "success") {
          const rate = data.conversion_rate;
          
          // Cache the rate
          rateCache.current[cacheKey] = { rate, timestamp: now };
          
          setExchangeRate(rate);
          const numAmount = parseFloat(amount) || 0;
          setResult(numAmount * rate);
          setLastUpdate(new Date(data.time_last_update_unix * 1000).toLocaleDateString());
        } else {
          throw new Error(data["error-type"] || "Unknown error");
        }
      } catch (err) {
        console.error("Currency conversion error:", err);
        setError(t("dashboard.personalized.widgets.currencyConverter.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCurrency, toCurrency, API_KEY, t]);
  
  // Update result when amount changes (no API call)
  useEffect(() => {
    if (exchangeRate !== null) {
      const numAmount = parseFloat(amount) || 0;
      setResult(numAmount * exchangeRate);
    }
  }, [amount, exchangeRate]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      // Result will be updated by useEffect
    }
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find((c) => c.code === code)?.symbol || code;
  };

  return (
    <Widget
      title={t("dashboard.personalized.widgets.currencyConverter.title")}
      icon={Banknote}
      onHide={onHide}
    >
      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("dashboard.personalized.widgets.currencyConverter.amount")}
          </label>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="100"
          />
        </div>

        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("dashboard.personalized.widgets.currencyConverter.from")}
          </label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className="p-2 bg-purple-100 hover:bg-purple-200 rounded-full transition-colors"
            title={t("dashboard.personalized.widgets.currencyConverter.swap")}
          >
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("dashboard.personalized.widgets.currencyConverter.to")}
          </label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Result */}
        {loading ? (
          <div className="text-center py-4 text-gray-500">
            {t("dashboard.personalized.widgets.currencyConverter.loading")}
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500 text-sm">{error}</div>
        ) : result !== null ? (
          <div className="bg-purple-50 rounded-lg p-4 space-y-2">
            <div className="text-center">
              <div className="text-sm text-gray-600">
                {t("dashboard.personalized.widgets.currencyConverter.result")}
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {getCurrencySymbol(toCurrency)} {result.toFixed(2)}
              </div>
            </div>

            {exchangeRate !== null && (
              <div className="text-xs text-gray-500 text-center space-y-1">
                <div>
                  {t("dashboard.personalized.widgets.currencyConverter.rate")}:{" "}
                  1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                </div>
                {lastUpdate && (
                  <div>
                    {t(
                      "dashboard.personalized.widgets.currencyConverter.lastUpdate"
                    )}
                    : {lastUpdate}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Widget>
  );
};

export default CurrencyConverterWidget;
