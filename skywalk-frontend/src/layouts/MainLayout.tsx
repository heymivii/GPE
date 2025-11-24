import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import NavBar  from '../components/NavBar';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-right" />
      <NavBar />
      <main className="flex-1">
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
}