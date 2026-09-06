import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveCountry } from '../data/countryMappings';

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

/**
 * Clés du bloc `countries` indexées sur leur forme normalisée
 * (« unitedStates » et « United States » se rejoignent sur « unitedstates »).
 * Sert de repli quand resolveCountry ne trouve rien : le registre des pays
 * n'est peuplé que des pays ACTIFS, or un expert peut être rattaché à un pays
 * archivé — son pays s'affichait alors en anglais.
 *
 * Le bundle doit être demandé avec la langue RÉSOLUE. Le détecteur de navigateur
 * renseigne `i18n.language` avec l'étiquette complète (« fr-FR »), alors que les
 * ressources sont enregistrées sous « fr » : `getResourceBundle('fr-FR', …)`
 * renvoyait undefined, la table restait vide et le repli ne se déclenchait
 * jamais. La page d'accueil annonçait ainsi « nos destinations : France, Japan »
 * en pleine interface française, le Japon étant archivé donc absent du registre.
 */
function useCountryKeys(): Map<string, string> {
  // i18n peut être absent (mocks de test partiels) : ce repli est un confort
  // d'affichage, il ne doit jamais faire planter une page.
  const { i18n } = useTranslation() as {
    i18n?: {
      language?: string;
      resolvedLanguage?: string;
      getResourceBundle?: (l: string, ns: string) => unknown;
    };
  };
  const language = i18n?.resolvedLanguage ?? i18n?.language;
  return useMemo(() => {
    const map = new Map<string, string>();
    try {
      // « fr-FR » puis « fr » : selon la configuration, l'une ou l'autre porte
      // les ressources — on retient la première qui donne un bloc `countries`.
      const candidates = [language, language?.split('-')[0], 'fr'].filter(
        (l): l is string => !!l,
      );
      let bundle: { countries?: Record<string, string> } | undefined;
      for (const candidate of candidates) {
        bundle = i18n?.getResourceBundle?.(candidate, 'translation') as typeof bundle;
        if (bundle?.countries) break;
      }
      for (const key of Object.keys(bundle?.countries ?? {})) {
        map.set(normalize(key), `countries.${key}`);
      }
    } catch {
      // i18n mocké ou non initialisé : on se contentera du registre.
    }
    return map;
  }, [i18n, language]);
}

/**
 * Nom de pays dans la langue de l'interface.
 *
 * La base stocke les noms en anglais (« Switzerland », « United States ») :
 * affichés tels quels dans une interface française, ils donnaient des écrans
 * mi-anglais mi-français. On passe par le registre des pays pour retrouver la
 * clé i18n, et on retombe sur le nom d'origine si la traduction manque —
 * mieux vaut « Mali » que le nom d'une clé technique.
 */
export function useCountryName() {
  const { t } = useTranslation();
  const keys = useCountryKeys();

  return useCallback(
    (name?: string | null): string => {
      if (!name) return '';
      const country = resolveCountry(name);
      if (country) return t(country.i18nKey, { defaultValue: country.name });
      const key = keys.get(normalize(name));
      return key ? t(key, { defaultValue: name }) : name;
    },
    [t, keys],
  );
}

/**
 * Pays précédé de sa préposition : « en France », « aux États-Unis »,
 * « au Japon ». Les phrases du type « Découvrez la vie … » ne peuvent pas se
 * contenter d'un « en » figé dans le texte, qui donnait « en États-Unis ».
 * Repli sur le nom seul si la forme manque, plutôt qu'une phrase amputée.
 */
export function useCountryNameIn() {
  const { t } = useTranslation();

  return useCallback(
    (name?: string | null): string => {
      if (!name) return '';
      const country = resolveCountry(name);
      if (!country) return name;
      const key = country.i18nKey.replace('countries.', 'countriesIn.');
      return t(key, { defaultValue: t(country.i18nKey, { defaultValue: country.name }) });
    },
    [t],
  );
}
