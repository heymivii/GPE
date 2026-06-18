import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import './i18n';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { CostOfLivingProvider } from './contexts/CostOfLivingContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { useSupportedCountries } from './hooks/useSupportedCountries';

const queryClient = new QueryClient();

/**
 * Invisible component that runs useSupportedCountries() once at app startup.
 * This triggers the fetch of active countries/cities and calls hydrateCountries()
 * so that all synchronous consumers (resolveCountry, slugFromCode, etc.) reflect
 * the admin-activated list as soon as the data arrives.
 * Must be rendered inside QueryClientProvider.
 */
function CountriesHydrator(): null {
  useSupportedCountries();
  return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <CountriesHydrator />
        <CurrencyProvider>
          <CostOfLivingProvider>
            <RouterProvider router={router} />
          </CostOfLivingProvider>
        </CurrencyProvider>
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);
