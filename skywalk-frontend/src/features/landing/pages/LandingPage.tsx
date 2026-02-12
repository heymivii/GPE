import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Dropdown from '../components/Dropdown';
import DestinationCard from '../../dashboard/components/DestinationCard';
import LandingToolsSection from '../components/LandingToolsSection';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import { useAuth } from '../../../hooks/useAuth';

export default function LandingPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const popularDestinations = [
    {
      countryName: t('countries.japan'),
      flag: 'https://flagcdn.com/w80/jp.png',
      description: t('landing.destinations.japon.description'),
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
      isoCode: 'JP'
    },
    {
      countryName: t('countries.unitedStates'),
      flag: 'https://flagcdn.com/w80/us.png',
      description: t('landing.destinations.etats-unis.description'),
      image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1600&q=80',
      isoCode: 'US'
    },
    {
      countryName: t('countries.switzerland'),
      flag: 'https://flagcdn.com/w80/ch.png',
      description: t('landing.destinations.suisse.description'),
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      isoCode: 'CH'
    }
  ];

  return (
    <>
      <section className="min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-white to-gray-100 px-8">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          
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

          <div className="flex-1 w-full lg:w-1/2">
            <Dropdown />
          </div>
          
        </div>
      </section>

      <HowItWorks />

      <LandingToolsSection />

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
          <Link 
            to={`/destinations/${popularDestinations[0].isoCode}`}
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

          <div className="space-y-6">
            <Link 
              to={`/destinations/${popularDestinations[1].isoCode}`}
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
              to={`/destinations/${popularDestinations[2].isoCode}`}
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

      <Testimonials />
      <FAQ />
    </>
  );
}

