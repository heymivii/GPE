import { useTranslation } from 'react-i18next';
import LegalLayout, { LegalSection, ToFill } from '../components/LegalLayout';

export default function LegalNoticePage() {
  const { t } = useTranslation();
  return (
    <LegalLayout title={t('legal.notice.title', { defaultValue: "Mentions légales" })} intro={t('legal.notice.intro', { defaultValue: "Informations prévues par l'article 6 de la loi pour la confiance dans l'économie numérique." })}>
      <LegalSection title={t('legal.notice.publisher.title', { defaultValue: "Éditeur du site" })}>
        <p>
          {t('legal.notice.publisher.line1', { defaultValue: "SkyWalk — projet développé dans un cadre pédagogique (ETNA)." })}
          <br />
          {t('legal.notice.publisher.legalForm', { defaultValue: "Forme juridique et immatriculation :" })} <ToFill />
          <br />
          {t('legal.notice.publisher.address', { defaultValue: "Adresse :" })} <ToFill />, Paris, France
          <br />
          {t('legal.notice.publisher.contact', { defaultValue: "Contact :" })}{' '}
          <a href="mailto:contact@skywalk.com" className="font-medium text-brand-ink hover:underline">
            contact@skywalk.com
          </a>{' '}
          — +33 6 58 28 63 80
        </p>
      </LegalSection>

      <LegalSection title={t('legal.notice.director.title', { defaultValue: "Directeur de la publication" })}>
        <p><ToFill /></p>
      </LegalSection>

      <LegalSection title={t('legal.notice.hosting.title', { defaultValue: "Hébergement" })}>
        <p>{t('legal.notice.hosting.frontend.a', { defaultValue: "Interface : " })}<strong>Vercel Inc.</strong>{t('legal.notice.hosting.frontend.c', { defaultValue: ", 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com" })}</p>
        <p>{t('legal.notice.hosting.backend.a', { defaultValue: "Application et base de données : " })}<strong>Salesforce (Heroku)</strong>{t('legal.notice.hosting.backend.c', { defaultValue: ", 415 Mission Street, San Francisco, CA 94105, États-Unis — heroku.com" })}</p>
      </LegalSection>

      <LegalSection title={t('legal.notice.ip.title', { defaultValue: "Propriété intellectuelle" })}>
        <p>{t('legal.notice.ip.p1', { defaultValue: "La structure du site, ses textes et son interface sont la propriété de leurs auteurs. Les contenus publiés par les membres (messages du forum, retours d'expérience, biographies d'experts) restent la propriété de leurs auteurs respectifs." })}</p>
        <p>
          {t('legal.notice.ip.s1', { defaultValue: "Les données administratives citent leur source officielle. Les indicateurs de coût de la vie et de qualité de vie proviennent de " })}<strong>Numbeo</strong>{t('legal.notice.ip.s2', { defaultValue: ", les offres d'emploi d'" })}<strong>Adzuna</strong>{t('legal.notice.ip.s3', { defaultValue: ", les photographies de villes de " })}<strong>Wikimedia Commons</strong>{t('legal.notice.ip.s4', { defaultValue: ", les données géographiques d'" })}<strong>Open-Meteo</strong>{t('legal.notice.ip.s5', { defaultValue: ". Chaque donnée affichée renvoie à sa source." })}
        </p>
      </LegalSection>

      <LegalSection title={t('legal.notice.liability.title', { defaultValue: "Responsabilité" })}>
        <p>{t('legal.notice.liability.p1', { defaultValue: "Les informations administratives sont fournies à titre indicatif. Malgré la vérification des sources, elles peuvent évoluer ou ne pas correspondre à votre situation particulière : seules les administrations compétentes font foi. SkyWalk ne saurait être tenu responsable d'une décision prise sur la seule base des informations du site." })}</p>
      </LegalSection>

      <LegalSection title={t('legal.notice.report.title', { defaultValue: "Signaler un contenu" })}>
        <p>
          {t('legal.notice.report.a', { defaultValue: "Un contenu vous semble illicite ou erroné ? Signalez-le depuis le bouton prévu sur chaque message du forum, ou écrivez à " })}
          <a href="mailto:contact@skywalk.com" className="font-medium text-brand-ink hover:underline">
            contact@skywalk.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
