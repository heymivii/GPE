import { useTranslation } from 'react-i18next';
import LegalLayout, { LegalSection } from '../components/LegalLayout';

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <LegalLayout title={t('legal.about.title', { defaultValue: "À propos de SkyWalk" })} intro={t('legal.about.intro', { defaultValue: "Un compagnon d'expatriation qui ne vous fait pas deviner." })}>
      <LegalSection title={t('legal.about.problem.title', { defaultValue: "Le problème qu'on essaie de résoudre" })}>
        <p>{t('legal.about.problem.p1', { defaultValue: "Préparer une expatriation, c'est reconstituer soi-même un parcours éparpillé entre des sites officiels, des forums et des blogs, sans savoir ce qui est à jour ni ce qui s'applique à sa situation. On y perd du temps, et parfois des droits." })}</p>
      </LegalSection>

      <LegalSection title={t('legal.about.does.title', { defaultValue: "Ce que fait SkyWalk" })}>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t('legal.about.does.checklist.a', { defaultValue: "Une " })}<strong>{t('legal.about.does.checklist.b', { defaultValue: "checklist personnalisée" })}</strong>{t('legal.about.does.checklist.c', { defaultValue: " selon votre destination, votre objectif et votre situation, avec des échéances calculées depuis votre date de départ." })}</li>
          <li>{t('legal.about.does.sources.a', { defaultValue: "Des " })}<strong>{t('legal.about.does.sources.b', { defaultValue: "démarches adossées aux sources officielles" })}</strong>{t('legal.about.does.sources.c', { defaultValue: " : chaque étape porte le lien gouvernemental dont elle est tirée." })}</li>
          <li>{t('legal.about.does.cost.a', { defaultValue: "Des " })}<strong>{t('legal.about.does.cost.b', { defaultValue: "données de coût de la vie" })}</strong>{t('legal.about.does.cost.c', { defaultValue: " par ville, avec leur source et leur date de collecte." })}</li>
          <li>{t('legal.about.does.community.a', { defaultValue: "Une " })}<strong>{t('legal.about.does.community.b', { defaultValue: "communauté" })}</strong>{t('legal.about.does.community.c', { defaultValue: " : forum, retours de personnes déjà passées par la même étape, et des experts vérifiés joignables en message privé." })}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t('legal.about.principle.title', { defaultValue: "Notre principe : pas de contenu inventé" })}>
        <p>{t('legal.about.principle.p1', { defaultValue: "Les informations administratives affichées proviennent de sources officielles, vérifiées par notre équipe avant publication. Quand une donnée manque pour une ville ou un territoire, nous l'écrivons plutôt que de combler le vide. Les indicateurs chiffrés portent leur source et leur date de capture." })}</p>
      </LegalSection>

      <LegalSection title={t('legal.about.project.title', { defaultValue: "Le projet" })}>
        <p>{t('legal.about.project.p1', { defaultValue: "SkyWalk est développé dans un cadre pédagogique. Les informations proposées sont fournies à titre indicatif et ne remplacent pas l'avis d'une administration ou d'un professionnel du droit." })}</p>
        <p>
          {t('legal.about.project.contact', { defaultValue: "Une question, une erreur repérée ?" })}{' '}
          <a href="mailto:contact@skywalk.com" className="font-medium text-brand-ink hover:underline">
            contact@skywalk.com
          </a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
