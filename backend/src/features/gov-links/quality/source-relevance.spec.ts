/**
 * Fixtures = les VRAIES données fautives observées en base (projet #10, France).
 * Ces tests sont des non-régressions : si l'un d'eux casse, c'est que le pipeline
 * redevient capable de publier le bug d'origine.
 */
import {
  checkSourceRelevance,
  isSubNationalUrl,
  localContactLeak,
  detectDirection,
  detectAudience,
} from './source-relevance';

const FR_SUFFIXES = [
  'gouv.fr',
  'service-public.fr',
  'ameli.fr',
  'campusfrance.org',
];

// ── Cas réel n°1 : le lien « Calvados » (gov_link id 2 / admin_procedure id 1) ──────
const CALVADOS_URL =
  'https://demarche.numerique.gouv.fr/commencer/pref14-premieredemande-visad';
const CALVADOS_ACTIONS = [
  'Définir votre situation pour savoir quelles sont les pièces justificatives à réunir.',
  "Contacter l'adresse mail : pref-etrangers@calvados.gouv.fr si besoin.",
  'Remplir le formulaire et réunir les pièces justificatives.',
];

describe('isSubNationalUrl — portée géographique', () => {
  it('détecte pref14 (préfecture du Calvados) comme source non nationale', () => {
    const r = isSubNationalUrl(CALVADOS_URL, 'FR');
    expect(r.local).toBe(true);
  });

  it('accepte les portails nationaux français', () => {
    for (const url of [
      'https://www.service-public.fr/particuliers/vosdroits/F2413',
      'https://france-visas.gouv.fr/visa-de-long-sejour',
      'https://www.ameli.fr/assure/droits-demarches',
    ]) {
      expect(isSubNationalUrl(url, 'FR').local).toBe(false);
    }
  });

  it('traite un hôte officiel inconnu du registre national comme périmètre indéterminé', () => {
    expect(isSubNationalUrl('https://www.calvados.gouv.fr/x', 'FR').local).toBe(
      true,
    );
  });

  it('détecte un canton suisse', () => {
    expect(
      isSubNationalUrl('https://www.ge.ch/canton/permis', 'CH').local,
    ).toBe(true);
  });
});

describe('localContactLeak — coordonnées locales recopiées', () => {
  it("détecte l'email de la préfecture du Calvados dans les actions (cas réel)", () => {
    expect(localContactLeak(CALVADOS_ACTIONS, 'FR', FR_SUFFIXES)).toBe(
      'pref-etrangers@calvados.gouv.fr',
    );
  });

  it("ignore un email d'un portail national", () => {
    expect(
      localContactLeak(
        ['Écrire à contact@service-public.fr'],
        'FR',
        FR_SUFFIXES,
      ),
    ).toBeNull();
  });

  it('ignore un email hors domaines officiels (déjà couvert par ailleurs)', () => {
    expect(
      localContactLeak(['Écrire à info@exemple.com'], 'FR', FR_SUFFIXES),
    ).toBeNull();
  });
});

describe('detectDirection — arrivant vs partant', () => {
  it('marque « Français de l’étranger » comme sortant', () => {
    expect(
      detectDirection(['Services aux Français de l’étranger et expatriation']),
    ).toBe('outgoing');
  });

  it('laisse une page pour arrivants en incoming', () => {
    expect(detectDirection(['Demander un titre de séjour en France'])).toBe(
      'incoming',
    );
  });
});

describe('detectAudience — particulier / entreprise / local', () => {
  it('détecte le portail entreprises (cas réel : demarches-admin sur entreprendre.*)', () => {
    expect(
      detectAudience(
        'https://entreprendre.service-public.gouv.fr/vosdroits/R1475',
        'FR',
      ),
    ).toBe('business');
  });

  it('détecte un chemin /professionnels/', () => {
    expect(
      detectAudience(
        'https://www.service-public.fr/professionnels/vosdroits/F1',
        'FR',
      ),
    ).toBe('business');
  });

  it('classe une page nationale grand public en individual', () => {
    expect(
      detectAudience(
        'https://www.service-public.fr/particuliers/vosdroits/F2413',
        'FR',
      ),
    ).toBe('individual');
  });
});

describe('checkSourceRelevance — verdict composite', () => {
  it('rejette le lien Calvados avec des raisons lisibles (portée + email local)', () => {
    const v = checkSourceRelevance(
      {
        countryCode: 'FR',
        category: 'demarches',
        url: CALVADOS_URL,
        actions: CALVADOS_ACTIONS,
      },
      FR_SUFFIXES,
    );
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/non nationale/);
    expect(v.reason).toMatch(/calvados\.gouv\.fr/);
  });

  it('rejette le portail entreprises pour une catégorie particulier (cas réel demarches-admin)', () => {
    const v = checkSourceRelevance(
      {
        countryCode: 'FR',
        category: 'demarches-admin',
        url: 'https://entreprendre.service-public.gouv.fr/vosdroits/R1475',
        actions: ['Transmettre le formulaire à l’ambassade.'],
      },
      FR_SUFFIXES,
    );
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/portail entreprises/);
  });

  it('accepte le même portail entreprises pour la catégorie « business »', () => {
    const v = checkSourceRelevance(
      {
        countryCode: 'FR',
        category: 'business',
        url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F36746',
        actions: ["Réaliser la demande d'immatriculation en ligne."],
      },
      FR_SUFFIXES,
    );
    expect(v.ok).toBe(true);
  });

  it('accepte france-visas.gouv.fr pour la catégorie visa (lien sain en base)', () => {
    const v = checkSourceRelevance(
      {
        countryCode: 'FR',
        category: 'visa',
        url: 'https://france-visas.gouv.fr/visa-de-long-sejour',
        actions: ['Vérifier si votre nationalité vous dispense de visa.'],
      },
      FR_SUFFIXES,
    );
    expect(v.ok).toBe(true);
    expect(v.direction).toBe('incoming');
    expect(v.audience).toBe('individual');
  });

  it("un lien de pied de page « Français de l'étranger » au-delà de l'entame ne disqualifie pas la page", () => {
    const longIntro = 'Demander un titre de séjour en France. '.repeat(60); // > 2000 chars
    const v = checkSourceRelevance(
      {
        countryCode: 'FR',
        category: 'demarches',
        url: 'https://www.service-public.fr/particuliers/vosdroits/N110',
        actions: ['Déposer la demande de titre de séjour en ligne.'],
        pageText: `${longIntro} Français de l'étranger`,
      },
      FR_SUFFIXES,
    );
    expect(v.ok).toBe(true);
  });
});

describe('trustedSource — une URL épinglée par un admin est vouchée', () => {
  it("une épingle vers un site étatique US (DMV) n'est plus bloquée par la portée", () => {
    const v = checkSourceRelevance(
      {
        countryCode: 'US',
        category: 'transport',
        url: 'https://dmv.ny.gov/driver-license/new-york-state-residents',
        actions: ['Échanger son permis étranger auprès du DMV de son État.'],
      },
      ['.gov'],
      { trustedSource: true },
    );
    expect(v.ok).toBe(true);
  });

  it('la même URL sans épingle reste signalée comme non nationale', () => {
    const v = checkSourceRelevance(
      {
        countryCode: 'US',
        category: 'transport',
        url: 'https://dmv.ny.gov/driver-license/new-york-state-residents',
        actions: ['Échanger son permis étranger auprès du DMV de son État.'],
      },
      ['.gov'],
    );
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/non nationale/);
  });

  it("l'épingle ne désarme PAS les contrôles de contenu (email local recopié)", () => {
    const v = checkSourceRelevance(
      {
        countryCode: 'FR',
        category: 'demarches',
        url: CALVADOS_URL,
        actions: CALVADOS_ACTIONS,
      },
      FR_SUFFIXES,
      { trustedSource: true },
    );
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/calvados\.gouv\.fr/);
    expect(v.reason).not.toMatch(/non nationale/);
  });
});

describe('pages communautaires — cas réel : fil du forum ameli élu pour « sante »', () => {
  const FORUM_URL =
    'https://forum-assures.ameli.fr/questions/3598427-affiliation-assurance-maladie-europeen-inactif';

  it('rejette un fil de forum même sur un domaine officiel', () => {
    const v = checkSourceRelevance(
      {
        countryCode: 'FR',
        category: 'sante',
        url: FORUM_URL,
        actions: ['Soumettre une nouvelle demande d’affiliation.'],
      },
      FR_SUFFIXES,
    );
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/communautaire/);
  });

  it('le signale MÊME épinglé (une épingle vers un forum est presque sûrement une erreur)', () => {
    const v = checkSourceRelevance(
      { countryCode: 'FR', category: 'sante', url: FORUM_URL, actions: [] },
      FR_SUFFIXES,
      { trustedSource: true },
    );
    expect(v.ok).toBe(false);
  });

  it("n'affecte pas la page ameli institutionnelle", () => {
    const v = checkSourceRelevance(
      {
        countryCode: 'FR',
        category: 'sante',
        url: 'https://www.ameli.fr/assure/droits-demarches/principes/protection-universelle-maladie',
        actions: [
          "Demander l'affiliation à la protection universelle maladie.",
        ],
      },
      FR_SUFFIXES,
    );
    expect(v.ok).toBe(true);
  });
});
