import { Outlet, Link } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1.5fr_1.9fr]">
      <ScrollToTop />
      <div className="hidden md:block bg-cover bg-center round" style={{ backgroundImage: "url('/img.png')" }}>
        <div className="h-full w-full flex items-center justify-between p-8 flex-col">
          <Link to="/" className="cursor-pointer">
            <img src="/LogoSW.svg" alt="Logo" className="w-32" />
          </Link>
          <div className=" w-3/12 ">
            <p className="text-center font-bold">Simplifier chaque étape de votre expatriation</p>
          </div>
        </div> 
      </div>

      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo mobile - visible uniquement sur mobile */}
          <Link to="/" className="md:hidden flex justify-center mb-8">
            <span className="text-2xl font-bold font-aclonica text-gray-900">SkyWalk</span>
          </Link>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
}