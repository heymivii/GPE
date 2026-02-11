import { useState, useEffect } from 'react';
import { useCostOfLiving } from '../../../contexts/CostOfLivingContext';

export default function CostOfLivingTestPage() {
    const { data, isLoading, isError, error, city: ctxCity, country: ctxCountry, setTarget } = useCostOfLiving();

    const [cityInput, setCityInput] = useState('Paris');
    const [countryInput, setCountryInput] = useState('France');

    useEffect(() => {
        if (ctxCity) setCityInput(ctxCity);
        if (ctxCountry) setCountryInput(ctxCountry);
    }, [ctxCity, ctxCountry]);

    const handleFetch = () => {
        if (cityInput && countryInput) {
            setTarget(cityInput, countryInput);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Test Cost of Living API (Global Context)</h1>

            <div className="flex gap-4 items-end mb-8">
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                        type="text"
                        placeholder="City (e.g., Paris)"
                        className="w-full border p-2 rounded"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input
                        type="text"
                        placeholder="Country (e.g., France)"
                        className="w-full border p-2 rounded"
                        value={countryInput}
                        onChange={(e) => setCountryInput(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleFetch}
                    disabled={isLoading || !cityInput || !countryInput}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? 'Fetching...' : 'Update Context'}
                </button>
            </div>

            {isError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <p>Error: {(error instanceof Error ? error.message : null) || 'An error occurred'}</p>
                </div>
            )}

            {data && (
                <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 p-4 rounded text-green-800 mb-4">
                        <strong>Context Active:</strong> Data loaded for {data.city.name}, {data.city.country}. This data is now available globally!
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Summary for {data.city.name}, {data.city.country}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Monthly Budget (Avg)</p>
                                <p className="text-lg font-medium">{data.summary?.monthlyBudget?.avg?.toFixed(2)} {data.currency.code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Avg Salary</p>
                                <p className="text-lg font-medium">{data.summary?.averageSalary?.toFixed(2)} {data.currency.code}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Housing (Rent)</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between border-b pb-2">
                                <span>1 Bedroom (City Center)</span>
                                <span className="font-medium">{data.categories.housing.rent.oneBedroom.cityCenter.avg} {data.currency.code}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>1 Bedroom (Outside Center)</span>
                                <span className="font-medium">{data.categories.housing.rent.oneBedroom.outsideCenter.avg} {data.currency.code}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>3 Bedroom (City Center)</span>
                                <span className="font-medium">{data.categories.housing.rent.threeBedroom.cityCenter.avg} {data.currency.code}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Food (Market)</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between border-b pb-2">
                                <span>Milk (1L)</span>
                                <span className="font-medium">{data.categories.food.markets.milk1L.avg} {data.currency.code}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>Bread (500g)</span>
                                <span className="font-medium">{data.categories.food.markets.bread500g.avg} {data.currency.code}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>Eggs (12)</span>
                                <span className="font-medium">{data.categories.food.markets.eggs12.avg} {data.currency.code}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-2">Raw Cleaned Data (Debug)</h3>
                        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-96">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
