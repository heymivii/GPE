import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Accueil</div>,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);
