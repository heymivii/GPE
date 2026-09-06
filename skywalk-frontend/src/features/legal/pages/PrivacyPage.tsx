import LegalLayout, { LegalSection, ToFill } from '../components/LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      intro="Quelles données nous collectons, pourquoi, et ce que vous pouvez exiger."
    >
      <LegalSection title="Ce que nous collectons, et pourquoi">
        <p>Nous ne collectons que ce dont le service a besoin pour fonctionner.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Votre compte</strong> — prénom, nom, email, mot de passe (chiffré, jamais
            stocké en clair), date de dernière connexion. Nécessaire pour vous identifier.
          </li>
          <li>
            <strong>Votre profil</strong> — âge, statut, pays d'origine, niveau de langue, langues
            parlées. Sert à personnaliser vos démarches : sans nationalité, par exemple, nous ne
            pouvons pas déterminer si un visa vous est nécessaire.
          </li>
          <li>
            <strong>Vos projets d'expatriation</strong> — destination, date de départ envisagée,
            objectif, budget, situation familiale, avancement de vos démarches.
          </li>
          <li>
            <strong>Vos contributions</strong> — messages du forum, messages privés, retours
            d'expérience, avis sur les experts, documents que vous déposez.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Ce que nous ne faisons pas">
        <p>
          Nous ne vendons pas vos données, nous ne les cédons pas à des annonceurs, et nous
          n'utilisons aucun traceur publicitaire ni outil de mesure d'audience tiers.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          Seuls des cookies strictement nécessaires sont déposés : ceux qui maintiennent votre
          session (<code className="rounded bg-gray-100 px-1">access_token</code> et{' '}
          <code className="rounded bg-gray-100 px-1">refresh_token</code>). Ils sont{' '}
          <em>httpOnly</em> — inaccessibles au JavaScript de la page — et disparaissent à la
          déconnexion. Sans eux, impossible de rester connecté : ils ne requièrent pas de
          consentement préalable.
        </p>
      </LegalSection>

      <LegalSection title="Qui d'autre voit vos données">
        <p>
          Nos hébergeurs, <strong>Vercel</strong> et <strong>Heroku</strong>, techniquement
          nécessaires. Les emails transactionnels (confirmation d'adresse, réinitialisation de mot
          de passe) transitent par notre prestataire d'envoi.
        </p>
        <p>
          Les services que nous interrogeons pour enrichir le contenu — Numbeo, Adzuna, Open-Meteo,
          Wikipédia — sont appelés <strong>depuis nos serveurs</strong> et ne reçoivent aucune
          donnée vous concernant.
        </p>
      </LegalSection>

      <LegalSection title="Ce que les autres membres voient">
        <p>
          Votre prénom, votre nom et votre pays d'origine apparaissent sur vos messages publics du
          forum. Si vous activez le partage d'expérience, votre prénom peut apparaître auprès des
          personnes préparant la même démarche. Vos projets, vos documents et vos messages privés
          restent privés.
        </p>
      </LegalSection>

      <LegalSection title="Combien de temps">
        <p>
          Vos données sont conservées tant que votre compte existe. La suppression de votre compte,
          depuis votre profil, efface vos données personnelles. Les messages publics du forum
          peuvent être conservés de façon anonymisée pour ne pas trouer les discussions.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et
          d'opposition sur vos données (RGPD, articles 15 à 22). Le profil permet déjà de consulter,
          corriger et supprimer vos informations. Pour toute autre demande, écrivez à{' '}
          <a href="mailto:contact@skywalk.com" className="font-medium text-[#5EA3C0] hover:underline">
            contact@skywalk.com
          </a>
          .
        </p>
        <p>
          Vous pouvez également introduire une réclamation auprès de la CNIL (
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#5EA3C0] hover:underline"
          >
            cnil.fr
          </a>
          ).
        </p>
        <p>
          Responsable du traitement : <ToFill>à compléter</ToFill>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
