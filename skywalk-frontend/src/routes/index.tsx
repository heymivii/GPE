import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage'
import AuthLayout from '../layouts/AuthLayout';
import LandingPage from '../features/landing/pages/LandingPage';
import MainLayout from '../layouts/MainLayout';
import PasswordForgotPage from '../features/auth/pages/PasswordForgotPage';
import FormPage from '../features/forms/pages/FormPage';
import DashboardPage from '../features/dashboard/pages/dashboard';
import PersonalizedDashboard from '../features/dashboard/pages/PersonalizedDashboard';
import OnboardingFlow from '../features/onboarding/pages/OnboardingFlow';
import SearchPage from '../features/search/pages/SearchPage';
import ForumPage from '../features/forum/pages/ForumPage';
import PostDetailPage from '../features/forum/pages/PostDetailPage';
import NewPostPage from '../features/forum/pages/NewPostPage';
import EditTopicPage from '../features/forum/pages/EditTopicPage';

export const router = createBrowserRouter([
{
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'forum', element: <ForumPage /> },
      //{ path: 'about', element: <AboutPage /> },

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
{
    path: '/dashboard', 
    element: <MainLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'personalized', element: <PersonalizedDashboard /> },
    ],
  },
  {
    path: '/onboarding',
    element: <OnboardingFlow />,
  },
  {
    path: '/forum',
    element: <MainLayout />,
    children: [
      { index: true, element: <ForumPage /> },
      { path: 'post/:id', element: <PostDetailPage /> },
      { path: 'post/:id/edit', element: <EditTopicPage /> },
      { path: 'new', element: <NewPostPage /> },
    ],
  },
  {
    path: '/personalized',
    element: <MainLayout />,
    children: [
      { index: true, element: <PersonalizedDashboard /> },
    ],
  },
]);
