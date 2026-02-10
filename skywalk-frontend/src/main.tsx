import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import './i18n'; // Import i18n configuration
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const queryClient = new QueryClient();

import { CostOfLivingProvider } from './contexts/CostOfLivingContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <CostOfLivingProvider>
            <RouterProvider router={router} />
          </CostOfLivingProvider>
        </CurrencyProvider>
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);