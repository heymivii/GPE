import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Briefcase, Home, Bus, Heart, ArrowRight } from 'lucide-react';

export default function LandingToolsSection() {
  const { t } = useTranslation();

  const tools = [
    {
      id: 'emploi',
      title: t('landing.tools.categories.emploi'),
      description: 'Find salaries, job demand, and working conditions for your target destination.',
      icon: Briefcase,
      link: '/services/emploi'
    },
    {
      id: 'logement',
      title: t('landing.tools.categories.logement'),
      description: 'Compare rent prices, utility costs, and housing availability to plan your budget.',
      icon: Home,
      link: '/services/logement'
    },
    {
      id: 'transport',
      title: t('landing.tools.categories.transport'),
      description: 'Estimate monthly transportation costs and explore local transit options.',
      icon: Bus,
      link: '/services/transport'
    },
    {
      id: 'sante',
      title: t('landing.tools.categories.sante'),
      description: 'Understand healthcare quality, insurance costs, and medical facility standards.',
      icon: Heart,
      link: '/services/sante'
    }
  ];

  return (
    <section className="py-20 sm:py-32 px-4 sm:px-8 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f] mb-4 font-outfit">
            {t('landing.tools.title')}
          </h2>
          <p className="text-lg sm:text-xl text-[#86868b] max-w-2xl mx-auto font-medium">
            {t('landing.tools.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.link}
              className="group relative bg-white rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100/50 flex flex-col h-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mb-8 text-[#1d1d1f] group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm transition-all duration-500">
                  <tool.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>

                <h3 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] mb-3 font-outfit">
                  {tool.title}
                </h3>

                <p className="text-[#86868b] leading-relaxed mb-8 flex-grow">
                  {tool.description}
                </p>

                <div className="flex items-center mt-auto">
                  <span className="text-sm font-semibold text-[#1d1d1f]">Explore</span>
                  <ArrowRight className="w-4 h-4 ml-2 text-gray-400 group-hover:text-[#1d1d1f] group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
