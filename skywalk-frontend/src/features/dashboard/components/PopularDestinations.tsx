import DestinationCard from './DestinationCard'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const destinations = [
  {
    i18nKey: 'japan',
    flag: 'https://flagcdn.com/w80/jp.png',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
    isoCode: 'JP'
  },
  {
    i18nKey: 'usa',
    flag: 'https://flagcdn.com/w80/us.png',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1600&q=80',
    isoCode: 'US'
  },
  {
    i18nKey: 'switzerland',
    flag: 'https://flagcdn.com/w80/ch.png',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    isoCode: 'CH'
  }
]

export default function PopularDestinations() {
  const { t } = useTranslation()

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 font-outfit">
              {t('popularDestinations.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              {t('popularDestinations.subtitle')}
            </p>
          </div>
          
          <Link 
            to="/destinations" 
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-brand-ink font-bold rounded-full hover:bg-blue-100 transition-colors whitespace-nowrap"
          >
            {t('popularDestinations.viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Link to={`/destinations/${destinations[0].isoCode}`} className="lg:row-span-2 h-full min-h-[400px] block">
            <DestinationCard
              image={destinations[0].image}
              countryName={t(`popularDestinations.${destinations[0].i18nKey}.name`)}
              flag={destinations[0].flag}
              description={t(`popularDestinations.${destinations[0].i18nKey}.description`)}
              size="large"
              className="h-full"
            />
          </Link>

          <div className="space-y-6">
            <Link to={`/destinations/${destinations[1].isoCode}`} className="block">
              <DestinationCard
                image={destinations[1].image}
                countryName={t(`popularDestinations.${destinations[1].i18nKey}.name`)}
                flag={destinations[1].flag}
                description={t(`popularDestinations.${destinations[1].i18nKey}.description`)}
                size="small"
              />
            </Link>
            
            <Link to={`/destinations/${destinations[2].isoCode}`} className="block">
              <DestinationCard
                image={destinations[2].image}
                countryName={t(`popularDestinations.${destinations[2].i18nKey}.name`)}
                flag={destinations[2].flag}
                description={t(`popularDestinations.${destinations[2].i18nKey}.description`)}
                size="small"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
