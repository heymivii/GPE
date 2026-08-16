import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MessagesSquare, ArrowRight, Plus, Loader2, MessageCircle } from 'lucide-react';
import Widget from './Widget';
import type { WidgetSize } from '../hooks/useDashboardPreferences';
import { forumTopicsApi } from '../../../api/forum-topics';

interface Props {
  countryId?: number;
  countryName?: string;
  onHide?: () => void;
  onResize?: (size: WidgetSize) => void;
  currentSize?: WidgetSize;
}

export default function DestinationForumWidget({
  countryId,
  countryName,
  onHide,
  onResize,
  currentSize,
}: Props) {
  const { t, i18n } = useTranslation();

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['forum-topics', 'all'],
    queryFn: forumTopicsApi.findAll,
    staleTime: 60_000,
  });

  // Derniers sujets pour le pays de destination (filtré côté client).
  const countryTopics = useMemo(() => {
    if (!countryId) return [];
    return topics
      .filter((tp) => tp.country?.idCountry === countryId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);
  }, [topics, countryId]);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'fr-FR', {
      day: 'numeric',
      month: 'short',
    });

  return (
    <Widget
      title={t('dashboard.personalized.widgets.destinationForum.title', { defaultValue: 'Forum de ta destination' })}
      subtitle={countryName || undefined}
      icon={MessagesSquare}
      iconColor="text-blue-600"
      onHide={onHide}
      onResize={onResize}
      currentSize={currentSize}
    >
      {isLoading ? (
        <div className="flex justify-center py-6 text-gray-400 flex-grow">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : countryTopics.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-6 gap-2 flex-grow">
          <MessageCircle className="w-8 h-8 text-gray-300" />
          <p className="text-sm text-gray-500">
            {t('dashboard.personalized.widgets.destinationForum.empty', {
              country: countryName || '',
              defaultValue: 'Aucune discussion pour {{country}} pour le moment.',
            })}
          </p>
          <Link
            to="/forum/new"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#5EA3C0] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('dashboard.personalized.widgets.destinationForum.start', { defaultValue: 'Lancer une discussion' })}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col flex-grow">
          <ul className="space-y-1 divide-y divide-gray-50">
            {countryTopics.map((tp) => (
              <li key={tp.topic_id}>
                <Link
                  to={`/forum/post/${tp.topic_id}`}
                  className="flex items-start gap-2 py-2 -mx-1 px-1 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{tp.title}</p>
                    <p className="text-[11px] text-gray-400">
                      {fmtDate(tp.created_at)}
                      {tp.views_count ? ` · ${tp.views_count} vues` : ''}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to="/forum"
            className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-medium text-[#5EA3C0] hover:underline"
          >
            {t('dashboard.personalized.widgets.destinationForum.seeAll', { defaultValue: 'Voir tout le forum' })}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </Widget>
  );
}
