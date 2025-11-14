import { Outlet } from 'react-router-dom';
import NavBar  from '../components/NavBar';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1">
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
}