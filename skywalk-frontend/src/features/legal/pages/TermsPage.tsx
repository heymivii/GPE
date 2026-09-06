import LegalLayout, { LegalSection } from '../components/LegalLayout';

export default function TermsPage() {
  return (
    <LegalLayout
      title="Conditions générales d'utilisation"
      intro="Ce que SkyWalk s'engage à faire, et ce que nous attendons de vous."
    >
      <LegalSection title="1. Objet">
        <p>
          SkyWalk est un service d'accompagnement à l'expatriation : checklists de démarches,
          informations sur les destinations, et mise en relation avec une communauté et des experts
          vérifiés. L'utilisation du service vaut acceptation des présentes conditions.
        </p>
      </LegalSection>

      <LegalSection title="2. Votre compte">
        <p>
          La création d'un compte requiert une adresse email valide, que vous confirmez par un lien
          reçu par email. Vous êtes responsable de la confidentialité de votre mot de passe et des
          actions effectuées depuis votre compte. Les informations que vous renseignez doivent être
          exactes : elles déterminent les démarches qui vous sont présentées.
        </p>
      </LegalSection>

      <LegalSection title="3. Ce que vous publiez">
        <p>Sur le forum, dans vos retours d'expérience et vos messages, vous vous engagez à ne pas publier :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>de propos injurieux, haineux, discriminatoires ou harcelants ;</li>
          <li>de données personnelles concernant un tiers sans son accord ;</li>
          <li>de contenu publicitaire ou frauduleux ;</li>
          <li>de conseil juridique présenté comme certifié si vous n'êtes pas expert vérifié.</li>
        </ul>
        <p>
          Vous restez propriétaire de vos contributions et nous accordez le droit de les afficher
          sur le service. Un contenu signalé peut être masqué le temps de sa vérification, et un
          compte suspendu en cas de manquement répété.
        </p>
      </LegalSection>

      <LegalSection title="4. Les experts vérifiés">
        <p>
          Le badge « expert vérifié » atteste qu'une pièce justificative (diplôme, inscription à un
          ordre, certification) a été contrôlée par notre équipe. Il ne constitue ni une garantie
          de résultat, ni un mandat : les échanges avec un expert relèvent de votre relation avec
          lui. Le badge peut être retiré à tout moment.
        </p>
      </LegalSection>

      <LegalSection title="5. Fiabilité des informations">
        <p>
          Les démarches affichées sont adossées à des sources officielles et vérifiées avant
          publication, avec leur date de collecte. Elles restent <strong>indicatives</strong> : une
          réglementation évolue, et votre situation peut relever d'un cas particulier. Seules les
          administrations compétentes font foi. Vérifiez toujours auprès de la source officielle
          avant une démarche engageante.
        </p>
      </LegalSection>

      <LegalSection title="6. Disponibilité">
        <p>
          Nous nous efforçons de maintenir le service accessible, sans garantie d'absence
          d'interruption. Certaines fonctionnalités dépendent de services tiers dont la
          disponibilité ne dépend pas de nous.
        </p>
      </LegalSection>

      <LegalSection title="7. Résiliation">
        <p>
          Vous pouvez supprimer votre compte à tout moment depuis votre profil, sans justification.
          Nous pouvons suspendre un compte en cas de manquement grave aux présentes conditions.
        </p>
      </LegalSection>

      <LegalSection title="8. Évolution des conditions">
        <p>
          Ces conditions peuvent être modifiées. En cas de changement substantiel, les membres sont
          informés. Pour toute question :{' '}
          <a href="mailto:contact@skywalk.com" className="font-medium text-brand-ink hover:underline">
            contact@skywalk.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
