/**
 * SkyWalk — Carnet d'adresses de recherche (search hints) pour le moteur gov-links.
 *
 * UNE fiche par (country_code, category). Elle dit au moteur OÙ chercher et COMMENT :
 *   - officialDomains : sites officiels à cibler en `site:<domaine> ...`
 *   - keywords        : les VRAIS termes admin (pas les mots génériques)
 *   - queryLang       : la langue dans laquelle interroger (fr/en/ja/de…)
 *   - excludeTerms    : pièges à exclure dès la recherche (-terme)
 *   - pinnedUrl       : override MANUEL. Si rempli → le moteur saute la recherche et prend ce lien.
 *
 * Destiné à une table éditable en admin (CRUD). Graine à relire/corriger.
 *
 * ✓ vérifié   = domaine confirmé par recherche web (juin 2026)
 * ⚑ pin manuel = pas de page gouv unique fiable → remplir pinnedUrl à la main
 */

export interface SearchHintSeed {
  countryCode: 'FR' | 'US' | 'JP' | 'CH';
  category: string;
  officialDomains: string[];
  keywords: string;
  queryLang: 'fr' | 'en' | 'ja' | 'de';
  excludeTerms: string[];
  pinnedUrl: string | null;
}

export const SEARCH_HINTS_SEED: SearchHintSeed[] = [
  // ───────────────────────── FRANCE (fr) — domaines stables ✓ ─────────────────────────
  {
    countryCode: 'FR',
    category: 'visa',
    officialDomains: ['france-visas.gouv.fr'],
    keywords: 'visa long séjour VLS-TS demande',
    queryLang: 'fr',
    excludeTerms: ['expatriation des français', 'quitter la france'],
    pinnedUrl:
      // Page canonique (vérifiée 08/2026). Sans épingle, france-visas bloquait notre
      // sonde (403 anti-robot) et le ranker retombait sur campusfrance à 0.30 —
      // le repli r.jina.ai du LinkVerifier rend cette page lisible.
      'https://france-visas.gouv.fr/visa-de-long-sejour',
  },
  {
    countryCode: 'FR',
    category: 'demarches',
    // ANEF : domaine complet vérifié (l'ancien `administration-etrangers.interieur.gouv.fr` ne résout pas).
    officialDomains: [
      'service-public.fr',
      'administration-etrangers-en-france.interieur.gouv.fr',
    ],
    keywords: 'carte de séjour titre de séjour première demande',
    queryLang: 'fr',
    excludeTerms: ['français à l’étranger'],
    // Fiche nationale « Titres, cartes de séjour… pour étranger en France » (vérifiée 08/2026) —
    // la recherche libre remontait la page de la préfecture du Calvados (pref14).
    pinnedUrl: 'https://www.service-public.fr/particuliers/vosdroits/N110',
  },
  {
    countryCode: 'FR',
    category: 'demarches-admin',
    officialDomains: [
      'administration-etrangers-en-france.interieur.gouv.fr',
      'service-public.fr',
    ],
    // Recentré : « démarches administratives » est flou, la recherche élisait des pages
    // de NICHE (regroupement familial — hors sujet pour un expatrié venu seul).
    keywords: 'nouvel arrivant France démarches essentielles installation',
    queryLang: 'fr',
    excludeTerms: ['statistiques', 'regroupement familial'],
    // ⚑ PAS d'épingle ANEF : le portail est une coquille Angular — 426 caractères de
    // texte sans JS, et même r.jina.ai en tire un Markdown vide (constaté 08/2026).
    // On laisse la recherche trouver une fiche à CONTENU ; le domaine ANEF reste ciblé.
    pinnedUrl: null,
  },
  {
    countryCode: 'FR',
    category: 'logement',
    officialDomains: [
      'service-public.fr',
      'dossierfacile.logement.gouv.fr',
      'anil.org',
    ],
    keywords: 'location logement dossier garant droits locataire',
    queryLang: 'fr',
    excludeTerms: ['logement social', 'hlm'],
    pinnedUrl: null,
  },
  {
    countryCode: 'FR',
    category: 'sante',
    officialDomains: ['ameli.fr', 'service-public.fr'],
    keywords: 'affiliation assurance maladie PUMa nouvel arrivant',
    queryLang: 'fr',
    excludeTerms: ['partir à l’étranger', 'expatriation', 'AME'],
    pinnedUrl:
      // F12859 « Assurance maladie d'un étranger qui s'installe en France » (titre vérifié
      // 08/2026). Sans épingle, la recherche élisait un FIL DE FORUM ameli (sous-domaine
      // officiel → allowlist) aux « actions » extraites d'une conversation privée.
      'https://www.service-public.fr/particuliers/vosdroits/F12859',
  },
  {
    countryCode: 'FR',
    category: 'emploi',
    officialDomains: [
      'service-public.fr',
      'travail-emploi.gouv.fr',
      'francetravail.fr',
    ],
    keywords: 'autorisation de travail salarié étranger',
    queryLang: 'fr',
    excludeTerms: [],
    // Fiche F2728 « Autorisation de travail d'un salarié étranger » (vérifiée 08/2026) — la
    // recherche libre remontait R58908, une page-formulaire sans contenu (actions vides).
    pinnedUrl: 'https://www.service-public.fr/particuliers/vosdroits/F2728',
  },
  {
    countryCode: 'FR',
    category: 'banque',
    officialDomains: ['service-public.fr', 'banque-france.fr'],
    keywords: 'ouvrir compte bancaire justificatifs',
    queryLang: 'fr',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'FR',
    category: 'transport',
    officialDomains: ['service-public.fr'],
    keywords: 'échange permis de conduire étranger non européen',
    queryLang: 'fr',
    excludeTerms: ['contrôle technique'],
    pinnedUrl: null,
  },
  {
    countryCode: 'FR',
    category: 'education',
    officialDomains: [
      'campusfrance.org',
      'service-public.fr',
      'monmaster.gouv.fr',
      'parcoursup.fr',
    ],
    keywords: 'inscription université étudiant étranger',
    queryLang: 'fr',
    excludeTerms: [],
    // Bonne source, mauvaise extraction historique (menu pris pour des tâches) : l'épingle
    // stabilise la source, le nouveau détourage + linter soignent le contenu.
    pinnedUrl:
      'https://www.campusfrance.org/fr/candidature-enseignement-superieur-france',
  },
  {
    countryCode: 'FR',
    category: 'culture',
    officialDomains: ['service-public.fr'], // ⚑ faible — catégorie molle
    keywords: 'vie culturelle associations loisirs nouveaux arrivants',
    queryLang: 'fr',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'FR',
    category: 'business',
    officialDomains: [
      'entreprendre.service-public.fr',
      'autoentrepreneur.urssaf.fr',
      'formalites.entreprises.gouv.fr',
    ],
    keywords: 'créer entreprise auto-entrepreneur immatriculation',
    queryLang: 'fr',
    excludeTerms: [],
    pinnedUrl: null,
  },

  // ───────────────────────── ÉTATS-UNIS (en) ─────────────────────────
  {
    countryCode: 'US',
    category: 'visa',
    officialDomains: ['travel.state.gov'], // ✓
    keywords: 'US visa types nonimmigrant apply',
    queryLang: 'en',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'US',
    category: 'demarches',
    officialDomains: ['uscis.gov'], // ✓
    keywords: 'green card permanent residence adjust status',
    queryLang: 'en',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'US',
    category: 'demarches-admin',
    officialDomains: ['ssa.gov', 'usa.gov'], // ✓ SSN
    keywords: 'social security number SSN apply noncitizen',
    queryLang: 'en',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'US',
    category: 'logement',
    officialDomains: ['usa.gov', 'hud.gov'], // ⚑ marché privé — peu de page « démarche », souvent informatif
    keywords: 'renting apartment lease tenant rights',
    queryLang: 'en',
    excludeTerms: ['section 8', 'low income', 'public housing'],
    pinnedUrl: null,
  },
  {
    countryCode: 'US',
    category: 'sante',
    officialDomains: ['healthcare.gov', 'usa.gov'], // ✓ ACA marketplace
    keywords: 'health insurance marketplace enroll',
    queryLang: 'en',
    excludeTerms: ['medicare', 'over 65'],
    pinnedUrl: null,
  },
  {
    countryCode: 'US',
    category: 'emploi',
    officialDomains: ['uscis.gov', 'usa.gov'], // ✓ EAD
    keywords: 'employment authorization EAD work permit',
    queryLang: 'en',
    excludeTerms: ['department of transportation'],
    pinnedUrl: null,
  },
  {
    countryCode: 'US',
    category: 'banque',
    officialDomains: ['fdic.gov', 'consumerfinance.gov'], // ✓
    keywords: 'open a bank account documents',
    queryLang: 'en',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'US',
    category: 'transport',
    officialDomains: ['usa.gov'], // ⚑ le permis est au niveau ÉTAT (DMV) → pinnedUrl du DMV de l'État visé
    keywords: 'new resident driver license state DMV',
    queryLang: 'en',
    excludeTerms: ['department of transportation agency'],
    pinnedUrl: null,
  },
  {
    countryCode: 'US',
    category: 'education',
    officialDomains: ['educationusa.state.gov'], // ✓
    keywords: 'study in the US international students',
    queryLang: 'en',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'US',
    category: 'culture',
    officialDomains: ['usa.gov'], // ⚑ faible
    keywords: 'community resources newcomers immigrants',
    queryLang: 'en',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'US',
    category: 'business',
    officialDomains: ['sba.gov', 'irs.gov'], // ✓
    keywords: 'start a business register LLC EIN',
    queryLang: 'en',
    excludeTerms: [],
    pinnedUrl: null,
  },

  // ───────────────────────── JAPON (ja — recherche en japonais) ─────────────────────────
  {
    countryCode: 'JP',
    category: 'visa',
    officialDomains: ['mofa.go.jp', 'isa.go.jp'], // ✓ MOFA = visa, ISA = statut de résidence
    keywords: 'ビザ 在留資格 申請',
    queryLang: 'ja',
    excludeTerms: [],
    pinnedUrl: 'https://www.mofa.go.jp/j_info/visit/visa/',
  },
  {
    countryCode: 'JP',
    category: 'demarches',
    officialDomains: ['isa.go.jp', 'moj.go.jp'], // ✓ ISA (sous moj.go.jp/isa)
    keywords: '在留カード 交付 手続き',
    queryLang: 'ja',
    excludeTerms: [],
    pinnedUrl:
      'https://www.moj.go.jp/isa/applications/procedures/whatzairyu_00001.html',
  },
  {
    countryCode: 'JP',
    category: 'demarches-admin',
    officialDomains: ['soumu.go.jp', 'moj.go.jp'], // ✓ enregistrement résident + My Number + portail ISA
    keywords: '住民登録 マイナンバー 転入届',
    queryLang: 'ja',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'JP',
    category: 'sante',
    officialDomains: ['mhlw.go.jp', 'studyinjapan.go.jp'], // ✓ NHI au guichet municipal, MHLW = overview
    keywords: '国民健康保険 加入 手続き',
    queryLang: 'ja',
    excludeTerms: ['年金', '社会保障協定'],
    pinnedUrl: null,
  }, // exclut retraite / accord sécu
  {
    countryCode: 'JP',
    category: 'emploi',
    officialDomains: ['mhlw.go.jp', 'ssw.go.jp', 'isa.go.jp'], // ✓
    keywords: '就労 在留資格 外国人',
    queryLang: 'ja',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'JP',
    category: 'banque',
    officialDomains: [], // ⚑ pas de page gouv unique (Japan Post / banques privées) → pinnedUrl manuel
    keywords: '銀行口座 開設 外国人',
    queryLang: 'ja',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'JP',
    category: 'transport',
    officialDomains: ['npa.go.jp', 'jaf.or.jp'], // ✓ NPA régule, JAF = traduction ; centre permis = préfectoral
    keywords: '外国免許 切替 運転免許 試験場',
    queryLang: 'ja',
    excludeTerms: [],
    pinnedUrl: null,
  }, // ⚑ procédure préfectorale → pin conseillé
  {
    countryCode: 'JP',
    category: 'education',
    officialDomains: ['studyinjapan.go.jp'], // ✓
    keywords: '日本 留学 外国人学生',
    queryLang: 'ja',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'JP',
    category: 'culture',
    officialDomains: ['moj.go.jp'], // ⚑ faible — portail « daily life support » de l'ISA
    keywords: '生活 ガイド 外国人 支援',
    queryLang: 'ja',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'JP',
    category: 'business',
    officialDomains: ['jetro.go.jp'], // ✓ JETRO « Setting Up Business in Japan »
    keywords: '会社設立 起業 手続き',
    queryLang: 'ja',
    excludeTerms: [],
    pinnedUrl: null,
  },

  // ───────────────────────── SUISSE (fr — ajouter 'de' selon canton) ─────────────────────────
  {
    countryCode: 'CH',
    category: 'visa',
    officialDomains: ['sem.admin.ch'], // ✓
    keywords: 'visa entrée long séjour national D',
    queryLang: 'fr',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'CH',
    category: 'demarches',
    officialDomains: ['ch.ch', 'sem.admin.ch'], // ✓ permis B/L/C, autorité cantonale
    keywords: 'permis de séjour autorisation nouvel arrivant',
    queryLang: 'fr',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'CH',
    category: 'demarches-admin',
    officialDomains: ['ch.ch'], // ✓ annonce ≤ 14 j au contrôle des habitants (OCPM cantonal)
    keywords: 'annonce d’arrivée contrôle des habitants commune',
    queryLang: 'fr',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'CH',
    category: 'logement',
    officialDomains: ['ch.ch'],
    keywords: 'louer logement bail nouvel arrivant',
    queryLang: 'fr',
    excludeTerms: ['statistiques', 'loyer moyen'],
    pinnedUrl: null,
  },
  {
    countryCode: 'CH',
    category: 'sante',
    officialDomains: ['bag.admin.ch', 'ch.ch'], // ✓ page « résidents en Suisse » (PAS frontalier)
    keywords: 'assurance maladie LAMal obligatoire résident affiliation',
    queryLang: 'fr',
    excludeTerms: ['frontalier', 'permis G'],
    pinnedUrl: null,
  },
  {
    countryCode: 'CH',
    category: 'emploi',
    officialDomains: ['ch.ch', 'sem.admin.ch'], // ✓
    keywords: 'autorisation de travail permis emploi',
    queryLang: 'fr',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'CH',
    category: 'banque',
    officialDomains: [], // ⚑ pas de page gouv unique → pinnedUrl manuel
    keywords: 'ouvrir compte bancaire Suisse nouvel arrivant',
    queryLang: 'fr',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'CH',
    category: 'transport',
    officialDomains: ['astra.admin.ch', 'ch.ch'], // ✓ OFROU/ASTRA
    keywords: 'échange permis de conduire étranger',
    queryLang: 'fr',
    excludeTerms: ['départ à l’étranger'],
    pinnedUrl: null,
  },
  {
    countryCode: 'CH',
    category: 'education',
    officialDomains: ['swissuniversities.ch', 'ch.ch'], // ✓
    keywords: 'étudier en Suisse université admission',
    queryLang: 'fr',
    excludeTerms: ['ambassade', 'pérou'],
    pinnedUrl: null,
  },
  {
    countryCode: 'CH',
    category: 'culture',
    officialDomains: ['ch.ch'], // ⚑ faible
    keywords: 'intégration vie associative langue',
    queryLang: 'fr',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    countryCode: 'CH',
    category: 'business',
    officialDomains: ['easygov.swiss', 'kmu.admin.ch', 'ch.ch'], // ✓
    keywords: 'créer entreprise registre du commerce inscription',
    queryLang: 'fr',
    excludeTerms: [],
    pinnedUrl: null,
  },
];
