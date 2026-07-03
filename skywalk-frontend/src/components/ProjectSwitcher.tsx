import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Plane, Check, Plus } from 'lucide-react';
import { useProjects } from '../features/projects/hooks/useProjectMutations';
import { useActiveProject } from '../contexts/ActiveProjectContext';

/**
 * Site-wide active-project switcher (NavBar). Lets a signed-in user pick which expatriation
 * project the whole site is contextualised to — dashboard, checklist and the services pages
 * all read the active project from ActiveProjectContext.
 */
export default function ProjectSwitcher() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();
  const { activeProjectId, setActiveProjectId } = useActiveProject();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Default the active project to the most recent one once projects load.
  useEffect(() => {
    if (projects.length > 0 && (activeProjectId == null || !projects.some((p) => p.idProject === activeProjectId))) {
      setActiveProjectId(projects[projects.length - 1].idProject);
    }
  }, [projects, activeProjectId, setActiveProjectId]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (projects.length === 0) return null;

  const active = projects.find((p) => p.idProject === activeProjectId) ?? projects[projects.length - 1];
  const label = (p: typeof active) => p?.destinationCountry?.countryName || t('nav.myProject', { defaultValue: 'Mon projet' });

  const choose = (id: number) => {
    setActiveProjectId(id);
    setOpen(false);
    // Target the personalized dashboard directly — /dashboard is an index route
    // that redirects and drops the query string, losing ?project.
    navigate(`/dashboard/personalized?project=${id}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors max-w-[220px]"
        title={t('nav.activeProject', { defaultValue: 'Projet actif' })}
      >
        <Plane className="w-4 h-4 text-[#5EA3C0] flex-shrink-0" />
        <span className="truncate">{label(active)}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50">
            {t('nav.activeProject', { defaultValue: 'Projet actif' })}
          </p>
          <div className="max-h-72 overflow-y-auto py-1">
            {projects.map((p) => (
              <button
                key={p.idProject}
                type="button"
                onClick={() => choose(p.idProject)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                  p.idProject === active?.idProject ? 'text-[#5EA3C0] font-semibold' : 'text-gray-700'
                }`}
              >
                <Plane className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{label(p)}</span>
                {p.idProject === active?.idProject && <Check className="w-4 h-4 flex-shrink-0" />}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => { setOpen(false); navigate('/onboarding'); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-gray-600 hover:bg-gray-50 border-t border-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {t('nav.newProject', { defaultValue: 'Nouveau projet' })}
          </button>
        </div>
      )}
    </div>
  );
}
