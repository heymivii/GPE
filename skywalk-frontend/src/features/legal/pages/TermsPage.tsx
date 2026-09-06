import { useTranslation } from 'react-i18next';
import LegalLayout, { LegalSection } from '../components/LegalLayout';

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <LegalLayout title={t('legal.terms.title', { defaultValue: "Conditions générales d'utilisation" })} intro={t('legal.terms.intro', { defaultValue: "Ce que SkyWalk s'engage à faire, et ce que nous attendons de vous." })}>
      <LegalSection title={t('legal.terms.s1.title', { defaultValue: "1. Objet" })}><p>{t('legal.terms.s1.p1', { defaultValue: "SkyWalk est un service d'accompagnement à l'expatriation : checklists de démarches, informations sur les destinations, et mise en relation avec une communauté et des experts vérifiés. L'utilisation du service vaut acceptation des présentes conditions." })}</p></LegalSection>
      <LegalSection title={t('legal.terms.s2.title', { defaultValue: "2. Votre compte" })}><p>{t('legal.terms.s2.p1', { defaultValue: "La création d'un compte requiert une adresse email valide, que vous confirmez par un lien reçu par email. Vous êtes responsable de la confidentialité de votre mot de passe et des actions effectuées depuis votre compte. Les informations que vous renseignez doivent être exactes : elles déterminent les démarches qui vous sont présentées." })}</p></LegalSection>

      <LegalSection title={t('legal.terms.s3.title', { defaultValue: "3. Ce que vous publiez" })}>
        <p>{t('legal.terms.s3.intro', { defaultValue: "Sur le forum, dans vos retours d'expérience et vos messages, vous vous engagez à ne pas publier :" })}</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t('legal.terms.s3.li1', { defaultValue: "de propos injurieux, haineux, discriminatoires ou harcelants ;" })}</li>
          <li>{t('legal.terms.s3.li2', { defaultValue: "de données personnelles concernant un tiers sans son accord ;" })}</li>
          <li>{t('legal.terms.s3.li3', { defaultValue: "de contenu publicitaire ou frauduleux ;" })}</li>
          <li>{t('legal.terms.s3.li4', { defaultValue: "de conseil juridique présenté comme certifié si vous n'êtes pas expert vérifié." })}</li>
        </ul>
        <p>{t('legal.terms.s3.p2', { defaultValue: "Vous restez propriétaire de vos contributions et nous accordez le droit de les afficher sur le service. Un contenu signalé peut être masqué le temps de sa vérification, et un compte suspendu en cas de manquement répété." })}</p>
      </LegalSection>

      <LegalSection title={t('legal.terms.s4.title', { defaultValue: "4. Les experts vérifiés" })}><p>{t('legal.terms.s4.p1', { defaultValue: "Le badge « expert vérifié » atteste qu'une pièce justificative (diplôme, inscription à un ordre, certification) a été contrôlée par notre équipe. Il ne constitue ni une garantie de résultat, ni un mandat : les échanges avec un expert relèvent de votre relation avec lui. Le badge peut être retiré à tout moment." })}</p></LegalSection>

      <LegalSection title={t('legal.terms.s5.title', { defaultValue: "5. Fiabilité des informations" })}>
        <p>{t('legal.terms.s5.a', { defaultValue: "Les démarches affichées sont adossées à des sources officielles et vérifiées avant publication, avec leur date de collecte. Elles restent " })}<strong>{t('legal.terms.s5.b', { defaultValue: "indicatives" })}</strong>{t('legal.terms.s5.c', { defaultValue: " : une réglementation évolue, et votre situation peut relever d'un cas particulier. Seules les administrations compétentes font foi. Vérifiez toujours auprès de la source officielle avant une démarche engageante." })}</p>
      </LegalSection>

      <LegalSection title={t('legal.terms.s6.title', { defaultValue: "6. Disponibilité" })}><p>{t('legal.terms.s6.p1', { defaultValue: "Nous nous efforçons de maintenir le service accessible, sans garantie d'absence d'interruption. Certaines fonctionnalités dépendent de services tiers dont la disponibilité ne dépend pas de nous." })}</p></LegalSection>
      <LegalSection title={t('legal.terms.s7.title', { defaultValue: "7. Résiliation" })}><p>{t('legal.terms.s7.p1', { defaultValue: "Vous pouvez supprimer votre compte à tout moment depuis votre profil, sans justification. Nous pouvons suspendre un compte en cas de manquement grave aux présentes conditions." })}</p></LegalSection>

      <LegalSection title={t('legal.terms.s8.title', { defaultValue: "8. Évolution des conditions" })}>
        <p>
          {t('legal.terms.s8.a', { defaultValue: "Ces conditions peuvent être modifiées. En cas de changement substantiel, les membres sont informés. Pour toute question : " })}
          <a href="mailto:contact@skywalk.com" className="font-medium text-brand-ink hover:underline">
            contact@skywalk.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
