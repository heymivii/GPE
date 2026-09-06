import { useTranslation } from 'react-i18next';
import LegalLayout, { LegalSection, ToFill } from '../components/LegalLayout';

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <LegalLayout title={t('legal.privacy.title', { defaultValue: "Politique de confidentialité" })} intro={t('legal.privacy.intro', { defaultValue: "Quelles données nous collectons, pourquoi, et ce que vous pouvez exiger." })}>
      <LegalSection title={t('legal.privacy.collect.title', { defaultValue: "Ce que nous collectons, et pourquoi" })}>
        <p>{t('legal.privacy.collect.p1', { defaultValue: "Nous ne collectons que ce dont le service a besoin pour fonctionner." })}</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>{t('legal.privacy.collect.account.b', { defaultValue: "Votre compte" })}</strong>{t('legal.privacy.collect.account.c', { defaultValue: " — prénom, nom, email, mot de passe (chiffré, jamais stocké en clair), date de dernière connexion. Nécessaire pour vous identifier." })}</li>
          <li><strong>{t('legal.privacy.collect.profile.b', { defaultValue: "Votre profil" })}</strong>{t('legal.privacy.collect.profile.c', { defaultValue: " — âge, statut, pays d'origine, niveau de langue, langues parlées. Sert à personnaliser vos démarches : sans nationalité, par exemple, nous ne pouvons pas déterminer si un visa vous est nécessaire." })}</li>
          <li><strong>{t('legal.privacy.collect.projects.b', { defaultValue: "Vos projets d'expatriation" })}</strong>{t('legal.privacy.collect.projects.c', { defaultValue: " — destination, date de départ envisagée, objectif, budget, situation familiale, avancement de vos démarches." })}</li>
          <li><strong>{t('legal.privacy.collect.contributions.b', { defaultValue: "Vos contributions" })}</strong>{t('legal.privacy.collect.contributions.c', { defaultValue: " — messages du forum, messages privés, retours d'expérience, avis sur les experts, documents que vous déposez." })}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t('legal.privacy.dont.title', { defaultValue: "Ce que nous ne faisons pas" })}>
        <p>{t('legal.privacy.dont.p1', { defaultValue: "Nous ne vendons pas vos données, nous ne les cédons pas à des annonceurs, et nous n'utilisons aucun traceur publicitaire ni outil de mesure d'audience tiers." })}</p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.cookies.title', { defaultValue: "Cookies" })}>
        <p>
          {t('legal.privacy.cookies.a', { defaultValue: "Seuls des cookies strictement nécessaires sont déposés : ceux qui maintiennent votre session (" })}<code className="rounded bg-gray-100 px-1">access_token</code>{t('legal.privacy.cookies.and', { defaultValue: " et " })}<code className="rounded bg-gray-100 px-1">refresh_token</code>{t('legal.privacy.cookies.b', { defaultValue: "). Ils sont " })}<em>httpOnly</em>{t('legal.privacy.cookies.c', { defaultValue: " — inaccessibles au JavaScript de la page — et disparaissent à la déconnexion. Sans eux, impossible de rester connecté : ils ne requièrent pas de consentement préalable." })}
        </p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.others.title', { defaultValue: "Qui d'autre voit vos données" })}>
        <p>{t('legal.privacy.others.hosts.a', { defaultValue: "Nos hébergeurs, " })}<strong>Vercel</strong>{t('legal.privacy.others.hosts.and', { defaultValue: " et " })}<strong>Heroku</strong>{t('legal.privacy.others.hosts.c', { defaultValue: ", techniquement nécessaires. Les emails transactionnels (confirmation d'adresse, réinitialisation de mot de passe) transitent par notre prestataire d'envoi." })}</p>
        <p>{t('legal.privacy.others.services.a', { defaultValue: "Les services que nous interrogeons pour enrichir le contenu — Numbeo, Adzuna, Open-Meteo, Wikipédia — sont appelés " })}<strong>{t('legal.privacy.others.services.b', { defaultValue: "depuis nos serveurs" })}</strong>{t('legal.privacy.others.services.c', { defaultValue: " et ne reçoivent aucune donnée vous concernant." })}</p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.members.title', { defaultValue: "Ce que les autres membres voient" })}>
        <p>{t('legal.privacy.members.p1', { defaultValue: "Votre prénom, votre nom et votre pays d'origine apparaissent sur vos messages publics du forum. Si vous activez le partage d'expérience, votre prénom peut apparaître auprès des personnes préparant la même démarche. Vos projets, vos documents et vos messages privés restent privés." })}</p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.retention.title', { defaultValue: "Combien de temps" })}>
        <p>{t('legal.privacy.retention.p1', { defaultValue: "Vos données sont conservées tant que votre compte existe. La suppression de votre compte, depuis votre profil, efface vos données personnelles. Les messages publics du forum peuvent être conservés de façon anonymisée pour ne pas trouer les discussions." })}</p>
      </LegalSection>

      <LegalSection title={t('legal.privacy.rights.title', { defaultValue: "Vos droits" })}>
        <p>
          {t('legal.privacy.rights.a', { defaultValue: "Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition sur vos données (RGPD, articles 15 à 22). Le profil permet déjà de consulter, corriger et supprimer vos informations. Pour toute autre demande, écrivez à " })}
          <a href="mailto:contact@skywalk.com" className="font-medium text-brand-ink hover:underline">
            contact@skywalk.com
          </a>
          .
        </p>
        <p>
          {t('legal.privacy.rights.cnil.a', { defaultValue: "Vous pouvez également introduire une réclamation auprès de la CNIL (" })}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-ink hover:underline"
          >
            cnil.fr
          </a>
          {t('legal.privacy.rights.cnil.b', { defaultValue: ")." })}
        </p>
        <p>{t('legal.privacy.rights.controller', { defaultValue: "Responsable du traitement :" })} <ToFill /></p>
      </LegalSection>
    </LegalLayout>
  );
}
