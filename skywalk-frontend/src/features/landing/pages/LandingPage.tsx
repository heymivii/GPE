import { ArrowRightIcon } from 'lucide-react';
import Dropdown from '../components/Dropdown'
export default function LandingPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-white to-gray-100">
      <div className="p-8 w-5/12">
      <div className='flex flex-col gap-5'>

        <p className="font-outfit font-bold text-4xl md:text-7xl">Simplifiez votre expatriation</p>
        <p className='font-light'>Trouvez des infos claires, échangez avec des expatriés, et préparez votre départ sereinement.
       <br /> Commencez par répondre à notre questionnaire pour un accompagnement personnalisé.</p>
        <div className="mt-7">
          <button className="text-white bg-[#5EA3C0] border-none rounded-full pl-12 pr-20 py-5 text-base relative">Je prépare mon départ
            <div className="text-black bg-white absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full p-4">
              <ArrowRightIcon className="icon"/>
            </div>
          </button>
        </div>
      </div>
        <div className="mt-20 flex items-center justify-between w-full max-w-2xl ">
          <div className="flex-1 flex flex-col  min-w-0">
            <span className="text-3xl font-bold whitespace-nowrap">12 000+</span>
            <span className="text-gray-600 text-sm font-medium mt-1 break-words">expatriés accompagnés</span>
          </div>
          <div className="h-10 w-px bg-gray-300 mx-2 sm:mx-6" />
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-3xl font-bold whitespace-nowrap">95%</span>
            <span className="text-gray-600 text-sm font-medium mt-1 break-words">de satisfaction</span>
          </div>
          <div className="h-10 w-px bg-gray-300 mx-2 sm:mx-6" />
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-3xl font-bold whitespace-nowrap">20+</span>
            <span className="text-gray-600 text-sm font-medium mt-1 break-words">pays couverts</span>
          </div>
        </div>
        </div>
           <div className="p-8">
       <Dropdown/>
        </div>
    </div>
  );
}

