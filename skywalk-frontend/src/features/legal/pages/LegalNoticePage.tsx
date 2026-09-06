import LegalLayout, { LegalSection, ToFill } from '../components/LegalLayout';

export default function LegalNoticePage() {
  return (
    <LegalLayout
      title="Mentions légales"
      intro="Informations prévues par l'article 6 de la loi pour la confiance dans l'économie numérique."
    >
      <LegalSection title="Éditeur du site">
        <p>
          SkyWalk — projet développé dans un cadre pédagogique (ETNA).
          <br />
          Forme juridique et immatriculation : <ToFill>à compléter</ToFill>
          <br />
          Adresse : <ToFill>à compléter</ToFill>, Paris, France
          <br />
          Contact :{' '}
          <a href="mailto:contact@skywalk.com" className="font-medium text-[#5EA3C0] hover:underline">
            contact@skywalk.com
          </a>{' '}
          — +33 6 58 28 63 80
        </p>
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <p><ToFill>à compléter</ToFill></p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Interface : <strong>Vercel Inc.</strong>, 440 N Barranca Ave #4133, Covina, CA 91723,
          États-Unis — vercel.com
        </p>
        <p>
          Application et base de données : <strong>Salesforce (Heroku)</strong>, 415 Mission
          Street, San Francisco, CA 94105, États-Unis — heroku.com
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          La structure du site, ses textes et son interface sont la propriété de leurs auteurs. Les
          contenus publiés par les membres (messages du forum, retours d'expérience, biographies
          d'experts) restent la propriété de leurs auteurs respectifs.
        </p>
        <p>
          Les données administratives citent leur source officielle. Les indicateurs de coût de la
          vie et de qualité de vie proviennent de <strong>Numbeo</strong>, les offres d'emploi
          d'<strong>Adzuna</strong>, les photographies de villes de{' '}
          <strong>Wikimedia Commons</strong>, les données géographiques d'
          <strong>Open-Meteo</strong>. Chaque donnée affichée renvoie à sa source.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          Les informations administratives sont fournies à titre indicatif. Malgré la vérification
          des sources, elles peuvent évoluer ou ne pas correspondre à votre situation
          particulière : seules les administrations compétentes font foi. SkyWalk ne saurait être
          tenu responsable d'une décision prise sur la seule base des informations du site.
        </p>
      </LegalSection>

      <LegalSection title="Signaler un contenu">
        <p>
          Un contenu vous semble illicite ou erroné ? Signalez-le depuis le bouton prévu sur chaque
          message du forum, ou écrivez à{' '}
          <a href="mailto:contact@skywalk.com" className="font-medium text-[#5EA3C0] hover:underline">
            contact@skywalk.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
