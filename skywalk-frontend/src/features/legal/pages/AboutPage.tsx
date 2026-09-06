import LegalLayout, { LegalSection } from '../components/LegalLayout';

export default function AboutPage() {
  return (
    <LegalLayout
      title="À propos de SkyWalk"
      intro="Un compagnon d'expatriation qui ne vous fait pas deviner."
    >
      <LegalSection title="Le problème qu'on essaie de résoudre">
        <p>
          Préparer une expatriation, c'est reconstituer soi-même un parcours éparpillé entre des
          sites officiels, des forums et des blogs, sans savoir ce qui est à jour ni ce qui
          s'applique à sa situation. On y perd du temps, et parfois des droits.
        </p>
      </LegalSection>

      <LegalSection title="Ce que fait SkyWalk">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Une <strong>checklist personnalisée</strong> selon votre destination, votre objectif et
            votre situation, avec des échéances calculées depuis votre date de départ.
          </li>
          <li>
            Des <strong>démarches adossées aux sources officielles</strong> : chaque étape porte le
            lien gouvernemental dont elle est tirée.
          </li>
          <li>
            Des <strong>données de coût de la vie</strong> par ville, avec leur source et leur date
            de collecte.
          </li>
          <li>
            Une <strong>communauté</strong> : forum, retours de personnes déjà passées par la même
            étape, et des experts vérifiés joignables en message privé.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Notre principe : pas de contenu inventé">
        <p>
          Les informations administratives affichées proviennent de sources officielles, vérifiées
          par notre équipe avant publication. Quand une donnée manque pour une ville ou un
          territoire, nous l'écrivons plutôt que de combler le vide. Les indicateurs chiffrés
          portent leur source et leur date de capture.
        </p>
      </LegalSection>

      <LegalSection title="Le projet">
        <p>
          SkyWalk est développé dans un cadre pédagogique. Les informations proposées sont fournies
          à titre indicatif et ne remplacent pas l'avis d'une administration ou d'un professionnel
          du droit.
        </p>
        <p>
          Une question, une erreur repérée ?{' '}
          <a href="mailto:contact@skywalk.com" className="font-medium text-[#5EA3C0] hover:underline">
            contact@skywalk.com
          </a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
