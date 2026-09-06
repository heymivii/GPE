import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import NavBar  from '../components/NavBar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import GuestBanner from '../components/GuestBanner';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import { useAuth } from '../hooks/useAuth';
import { DestinationProvider } from '../contexts/DestinationContext';

export default function MainLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <DestinationProvider>
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <Toaster position="top-right" />
        <NavBar />
        {!isAuthenticated && <GuestBanner />}
        <EmailVerificationBanner />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </DestinationProvider>
  );
}