import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage'
import AuthLayout from '../layouts/AuthLayout';
import LandingPage from '../features/landing/pages/LandingPage';
import MainLayout from '../layouts/MainLayout';
import PasswordForgotPage from '../features/auth/pages/PasswordForgotPage';
import FormPage from '../features/forms/pages/FormPage';
export const router = createBrowserRouter([
{
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
    //   { path: 'about', element: <AboutPage /> },
      // autres pages publiques avec nav/footer
    ],
  },
  {
    path: '/auth', 
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'pwdForgot', element: <PasswordForgotPage /> },
    ],
  },
  {
  path: '/forms', 
  element: <MainLayout/>,
  children: [
    {index: true, element: <FormPage /> },
  ],
},

]);
