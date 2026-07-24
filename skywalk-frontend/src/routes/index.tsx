import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
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
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import ProfilePage from '../features/profile/pages/ProfilePage';
import { DestinationsPage } from '../features/destinations/pages/DestinationsPage';
import { DestinationDetailPage } from '../features/destinations/pages/DestinationDetailPage';
import ProjectsPage from '../features/projects/pages/ProjectsPage';
import ProjectDetailPage from '../features/projects/pages/ProjectDetailPage';
import ChecklistPage from '../features/projects/pages/ChecklistPage'; // ✅ AJOUT
import CountryComparison from '../features/comparison/pages/CountryComparison';
import ServicePage from '../features/services/pages/ServicePage';
import ServicesIndexPage from '../features/services/pages/ServicesIndexPage';
import CostOfLivingTestPage from '../features/cost-of-living/pages/CostOfLivingTestPage';
import BlogPage from '../features/blog/pages/BlogPage';
import BlogArticlePage from '../features/blog/pages/BlogArticlePage';
import AdminRoute from '../components/AdminRoute';
import AdminLayout from '../features/admin/components/AdminLayout';
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import AdminProjects from '../features/admin/pages/AdminProjects';
import AdminProcedures from '../features/admin/pages/AdminProcedures';
import AdminContinents from '../features/admin/pages/AdminContinents';
import AdminCountries from '../features/admin/pages/AdminCountries';
import AdminCities from '../features/admin/pages/AdminCities';
import AdminRoles from '../features/admin/pages/AdminRoles';
import MessagesPage from '../features/messages/pages/MessagesPage';

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <LandingPage /> },
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
    ],
  },

  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'search', element: <SearchPage /> },
      { path: 'services', element: <ServicesIndexPage /> },
      { path: 'services/:category', element: <ServicePage /> },
      { path: 'forum', element: <ForumPage /> },
      { path: 'destinations', element: <DestinationsPage /> },
      { path: 'destinations/:countrySlug', element: <DestinationDetailPage /> },
      { path: 'comparison', element: <CountryComparison /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'blog/:id', element: <BlogArticlePage /> },
      { path: 'visa', element: <Navigate to="/services/visa" replace /> },
      { path: 'test/cost-of-living', element: <CostOfLivingTestPage /> },
    ],
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
    path: '/onboarding',
    element: <MainLayout />,
    children: [
      { index: true, element: <OnboardingFlow /> },
      { path: ':id', element: <OnboardingFlow /> },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/forms',
        element: <MainLayout />,
        children: [
          { index: true, element: <FormPage /> },
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
        path: '/projects',
        element: <MainLayout />,
        children: [
          { index: true, element: <ProjectsPage /> },
          { path: ':id', element: <ProjectDetailPage /> },
          { path: ':id/checklist', element: <ChecklistPage /> }, // ✅ AJOUT
        ],
      },
      {
        path: '/profile',
        element: <MainLayout />,
        children: [
          { index: true, element: <ProfilePage /> },
        ],
      },
      {
        path: '/messages',
        element: <MainLayout />,
        children: [
          { index: true, element: <MessagesPage /> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'roles', element: <AdminRoles /> },
          { path: 'projects', element: <AdminProjects /> },
          { path: 'procedures', element: <AdminProcedures /> },
          { path: 'continents', element: <AdminContinents /> },
          { path: 'countries', element: <AdminCountries /> },
          { path: 'cities', element: <AdminCities /> },
        ],
      },
    ],
  },
]);