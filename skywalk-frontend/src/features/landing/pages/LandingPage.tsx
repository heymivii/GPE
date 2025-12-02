import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Dropdown from '../components/Dropdown';
import DestinationCard from '../../dashboard/components/DestinationCard';
import LandingToolsSection from '../components/LandingToolsSection';
import { useAuth } from '../../../hooks/useAuth';

export default function LandingPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  // Data for popular destinations with images
  const popularDestinations = [
    {
      countryName: 'Canada',
      flag: '🇨🇦',
      description: t('landing.destinations.canada.description'),
      image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=2311&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      slug: 'canada'
    },
    {
      countryName: 'France',
      flag: '🇫🇷',
      description: t('landing.destinations.france.description'),
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2346&auto=format&fit=crop',
      slug: 'france'
    },
    {
      countryName: 'Portugal',
      flag: '🇵🇹',
      description: t('landing.destinations.portugal.description'),
      image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      slug: 'portugal'
    }
  ];

  return (
    <>
      {/* Hero / CTA */}
      <section className="min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-white to-gray-100 px-8">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left side - Text content */}
          <div className="flex-1 w-full lg:w-1/2">
            <div className="flex flex-col gap-5">
              <p className="font-outfit font-bold text-4xl md:text-6xl lg:text-7xl">{t('landing.hero.title')}</p>
              <p className="font-light text-lg">{t('landing.hero.subtitle')}
                <br /> {t('landing.hero.subtitle2')}
              </p>

              <div className="mt-7">
                <Link 
                  to={isAuthenticated ? "/onboarding" : "/auth/register?redirect=/onboarding"}
                  className="inline-flex items-center text-white bg-[#5EA3C0] border-none rounded-full pl-12 pr-20 py-5 text-base relative hover:bg-[#4d8a9d] transition-colors"
                >
                  {t('landing.hero.cta')}
                  <div className="text-black bg-white absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full p-4">
                    <ArrowRightIcon className="icon" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="mt-20 flex items-center justify-between w-full max-w-2xl">
              <div className="flex-1 flex flex-col min-w-0">
                <span className="text-3xl font-bold whitespace-nowrap">12 000+</span>
                <span className="text-gray-600 text-sm font-medium mt-1 break-words">{t('landing.hero.stats.expats')}</span>
              </div>
              <div className="h-10 w-px bg-gray-300 mx-2 sm:mx-6" />
              <div className="flex-1 flex flex-col min-w-0">
                <span className="text-3xl font-bold whitespace-nowrap">95%</span>
                <span className="text-gray-600 text-sm font-medium mt-1 break-words">{t('landing.hero.stats.satisfaction')}</span>
              </div>
              <div className="h-10 w-px bg-gray-300 mx-2 sm:mx-6" />
              <div className="flex-1 flex flex-col min-w-0">
                <span className="text-3xl font-bold whitespace-nowrap">20+</span>
                <span className="text-gray-600 text-sm font-medium mt-1 break-words">{t('landing.hero.stats.countries')}</span>
              </div>
            </div>
          </div>

          {/* Right side - Search form */}
          <div className="flex-1 w-full lg:w-1/2">
            <Dropdown />
          </div>
          
        </div>
      </section>

      {/* Tools Section */}
      <LandingToolsSection />

      {/* Destinations — moved to bottom of the landing page */}
      <section className="mt-16 px-8 w-full max-w-7xl mx-auto pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3 font-outfit">{t('landing.destinations.title')}</h2>
            <p className="text-gray-600 text-lg">{t('landing.destinations.subtitle')}</p>
          </div>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-[#5EA3C0] font-bold rounded-full hover:bg-blue-100 transition-colors whitespace-nowrap"
          >
            {t('landing.destinations.viewAll')}
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Large card on the left */}
          <Link 
            to={`/destinations/${popularDestinations[0].slug}`}
            className="lg:row-span-2 h-full min-h-[400px] block"
          >
            <DestinationCard
              image={popularDestinations[0].image}
              countryName={popularDestinations[0].countryName}
              flag={popularDestinations[0].flag}
              description={popularDestinations[0].description}
              size="large"
              className="h-full"
            />
          </Link>

          {/* Two smaller cards on the right */}
          <div className="space-y-6">
            <Link 
              to={`/destinations/${popularDestinations[1].slug}`}
              className="block"
            >
              <DestinationCard
                image={popularDestinations[1].image}
                countryName={popularDestinations[1].countryName}
                flag={popularDestinations[1].flag}
                description={popularDestinations[1].description}
                size="small"
              />
            </Link>
            
            <Link 
              to={`/destinations/${popularDestinations[2].slug}`}
              className="block"
            >
              <DestinationCard
                image={popularDestinations[2].image}
                countryName={popularDestinations[2].countryName}
                flag={popularDestinations[2].flag}
                description={popularDestinations[2].description}
                size="small"
              />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

