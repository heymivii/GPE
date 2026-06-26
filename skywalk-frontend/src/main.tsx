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

// Vite HMR can re-execute this entry module without a page reload; calling createRoot()
// twice on the same container mounts TWO React trees on the same DOM (→ removeChild
// NotFoundError crashes). Reuse the existing root across hot updates instead.
const container = document.getElementById('root')!;
type RootContainer = HTMLElement & { __skywalkRoot?: ReactDOM.Root };
const rootContainer = container as RootContainer;
const root = rootContainer.__skywalkRoot ?? ReactDOM.createRoot(container);
rootContainer.__skywalkRoot = root;

root.render(
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
