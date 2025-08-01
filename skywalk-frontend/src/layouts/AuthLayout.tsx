import { Outlet } from "react-router-dom";
export default function AuthLayout() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1.5fr_1.9fr]">
      <div className="hidden md:block bg-cover bg-center round" style={{ backgroundImage: "url('/img.png')" }}>
        <div className="h-full w-full flex items-center justify-between p-8 flex-col">
          <img src="/LogoSW.svg" alt="Logo" className="w-32" />
          <div className=" w-3/12 ">
            <p className="text-center font-bold">Simplifier chaque étape de votre expatriation</p>
          </div>
        </div> 
      </div>

      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">  <Outlet /> </div>
      </div>
    </div>
  );
}