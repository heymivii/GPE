import { useTranslation } from 'react-i18next';

interface ServiceStat {
  label: string;
  value: string;
}

interface ServiceStatsProps {
  stats: ServiceStat[];
  color: string;
}

export default function ServiceStats({ stats }: ServiceStatsProps) {
  const { t } = useTranslation();
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t('services.guides.keyFigures')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
