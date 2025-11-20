import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router';
import Dropdown from '../components/Dropdown';
import { getTopDestinations } from '../../destinations/mockData';

export default function LandingPage() {
  const topDestinations = getTopDestinations(6);
  
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
        
        {/* Destinations populaires section */}
        <div className="mt-16 px-8 w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 px-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Destinations populaires
              </h2>
              <p className="text-gray-600 text-lg">
                Découvrez les pays les plus prisés par notre communauté
              </p>
            </div>
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-50 text-blue-600 font-medium rounded-full hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
              Voir tout
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
            {topDestinations.map((destination) => (
              <Link
                key={destination.id}
                to={`/destinations/${destination.slug}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 border border-gray-200 hover:border-blue-400"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{destination.flagEmoji}</span>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {destination.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {destination.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span className="flex items-center gap-1">
                    👥 {destination.stats.memberCount.toLocaleString('fr-FR')}
                  </span>
                  <span className="flex items-center gap-1">
                    💼 {destination.stats.jobOffersCount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
    </div>
  );
}

