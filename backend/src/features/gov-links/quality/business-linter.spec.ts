/**
 * Fixtures = les VRAIES extractions fautives observées en base (France).
 * Chaque describe correspond à une famille d'erreur réellement publiée.
 */
import {
  lintExtraction,
  contentlessActions,
  navigationLikeActions,
  dominantForeignCategory,
  dossierLikeActions,
} from './business-linter';
import { normalizeForMatch } from './grounding';

describe('hors-sujet — cas réel : « sante » qui parle emploi (admin_procedure id 3)', () => {
  const SANTE_HORS_SUJET = {
    category: 'sante',
    facts: [
      'Les résidents européens sont autorisés à venir en France pour chercher du travail comme demandeur d’emploi.',
      'Ils doivent accomplir des démarches auprès de France Travail (anciennement Pôle Emploi).',
      'Ils peuvent percevoir des allocations chômage sous conditions.',
    ],
    actions: [
      'Renseignez-vous sur le site internet de votre préfecture.',
      'Accomplissez des démarches auprès de France Travail.',
    ],
  };

  it('signale l’absence totale de vocabulaire santé', () => {
    const { flags } = lintExtraction(SANTE_HORS_SUJET);
    expect(flags.some((f) => f.includes('sante'))).toBe(true);
  });

  it('identifie « emploi » comme thème dominant du contenu', () => {
    const text = normalizeForMatch(
      [...SANTE_HORS_SUJET.facts, ...SANTE_HORS_SUJET.actions].join(' '),
    );
    const foreign = dominantForeignCategory(text, 'sante');
    expect(foreign?.category).toBe('emploi');
  });

  it('ne signale rien sur un vrai contenu santé', () => {
    const { flags } = lintExtraction({
      category: 'sante',
      facts: ['L’affiliation à l’assurance maladie (PUMa) est gratuite.'],
      actions: [
        'Demander l’ouverture des droits à la CPAM de votre domicile',
        'Créer un compte ameli une fois le numéro de sécurité sociale reçu',
      ],
    });
    expect(flags).toEqual([]);
  });
});

describe('vacuité — cas réel : « emploi » réduit à des étapes de formulaire (id 18)', () => {
  const EMPLOI_VIDE = [
    'Renseigner les informations demandées',
    'Joindre les justificatifs',
    'Valider votre saisie',
    'Attendre la réponse',
  ];

  it('reconnaît chacune des quatre actions comme sans contenu', () => {
    expect(contentlessActions(EMPLOI_VIDE)).toHaveLength(4);
  });

  it('signale l’extraction entière comme vide de contenu utile', () => {
    const { flags } = lintExtraction({
      category: 'emploi',
      actions: EMPLOI_VIDE,
    });
    expect(flags.some((f) => f.includes('sans contenu utile'))).toBe(true);
  });

  it('ne pénalise pas des actions précises contenant leur objet', () => {
    expect(
      contentlessActions([
        'Remplir le formulaire CERFA 15186*03 de demande d’autorisation de travail',
      ]),
    ).toHaveLength(0);
  });
});

describe('navigation — cas réel : menu Campus France pris pour des tâches (id 20)', () => {
  const CAMPUS_FRANCE_MENU = [
    'Trouver sa formation',
    'Préparer son arrivée',
    'Se renseigner sur les visas et cartes de séjour',
    'Ouvrir un compte bancaire',
    'Trouver un logement',
  ];

  it('repère la majorité d’entrées de menu', () => {
    const nav = navigationLikeActions(CAMPUS_FRANCE_MENU);
    expect(nav.length).toBeGreaterThanOrEqual(3);
  });

  it('signale l’extraction comme une liste de navigation', () => {
    const { flags } = lintExtraction({
      category: 'education',
      actions: CAMPUS_FRANCE_MENU,
    });
    expect(flags.some((f) => f.includes('entrées de menu'))).toBe(true);
  });
});

describe('dispositif inadapté — règle AME conservée', () => {
  it('signale l’AME sur la catégorie sante', () => {
    const { flags } = lintExtraction({
      category: 'sante',
      facts: ["L'AME couvre les soins des personnes en situation irrégulière."],
      actions: ["Demander l'AME auprès de la CPAM"],
    });
    expect(flags.some((f) => f.includes('AME'))).toBe(true);
  });

  it('ne signale pas l’AME hors catégorie sante', () => {
    const { flags } = lintExtraction({
      category: 'logement',
      actions: ['Signer le bail de location et verser le dépôt de garantie'],
    });
    expect(flags.some((f) => f.includes('AME'))).toBe(false);
  });
});

describe('contenus sains — zéro faux positif sur les liens corrects de la base', () => {
  it('banque (id 19) passe sans drapeau', () => {
    const { flags } = lintExtraction({
      category: 'banque',
      actions: [
        "Présenter une pièce d'identité officielle pour demander l'ouverture d'un compte bancaire.",
        'Renseignez-vous auprès de votre banque sur les conditions particulières pour ouvrir un livret, plan ou compte d’épargne.',
      ],
    });
    expect(flags).toEqual([]);
  });

  it('transport (id 17) passe sans drapeau', () => {
    const { flags } = lintExtraction({
      category: 'transport',
      actions: [
        'Répondre aux questions successives pour déterminer si vous devez échanger votre permis de conduire.',
      ],
    });
    expect(flags).toEqual([]);
  });
});

describe('niche familiale — cas réel : N11165 publié pour « demarches-admin »', () => {
  const N11165_ACTIONS = [
    'Utiliser le simulateur pour vérifier votre éligibilité au regroupement familial.',
    'Remplir le formulaire de demande de regroupement familial.',
    'Remplir le formulaire d’attestation de mise à disposition d’un logement dans le cadre d’un regroupement familial.',
  ];

  it('signale une extraction dominée par le regroupement familial', () => {
    const { flags } = lintExtraction({
      category: 'demarches-admin',
      actions: N11165_ACTIONS,
    });
    expect(flags.some((f) => f.includes('regroupement familial'))).toBe(true);
  });

  it('tolère une mention isolée dans une liste par ailleurs générale', () => {
    const { flags } = lintExtraction({
      category: 'demarches',
      actions: [
        'Déposer la demande de titre de séjour en ligne sur la plateforme nationale.',
        'Préparer les pièces justificatives : passeport, photos, justificatif de domicile.',
        'Vérifier votre éligibilité au regroupement familial le cas échéant.',
      ],
    });
    expect(flags.some((f) => f.includes('regroupement familial'))).toBe(false);
  });
});

describe('dossierLikeActions — alinéas de constitution de dossier', () => {
  // Les actions réellement extraites sur FR/business (retour de recette) :
  // un mode d'emploi d'immatriculation recopié, pas un guide de préparation.
  const dossierActions = [
    "Joindre un justificatif de domiciliation de l'entreprise (facture d'eau, d'électricité ou de gaz).",
    "Joindre la déclaration sur l'honneur de non-condamnation, datée et signée par l'entrepreneur.",
    "Joindre une copie de la pièce d'identité de l'entrepreneur.",
    "Si l'on souhaite protéger des biens immobiliers, faire établir une déclaration d'insaisissabilité chez notaire et joindre la copie au dossier.",
  ];

  it('détecte les alinéas « joindre X / chez notaire / au dossier »', () => {
    expect(dossierLikeActions(dossierActions)).toHaveLength(4);
  });

  it('ne signale pas les vraies actions de préparation génériques', () => {
    expect(
      dossierLikeActions([
        "Valider le VLS-TS en ligne dans les 3 mois suivant l'arrivée.",
        "Préparer le dossier d'immatriculation : pièce d'identité, justificatif de domiciliation, déclaration de non-condamnation.",
        "Accéder au guichet des formalités des entreprises et lancer la demande d'immatriculation.",
      ]),
    ).toHaveLength(0);
  });

  it('lintExtraction lève le drapeau quand les alinéas dominent', () => {
    const verdict = lintExtraction({
      category: 'business',
      facts: [],
      actions: dossierActions,
    });
    expect(
      verdict.flags.some((f: string) => f.includes('alinéas de dossier')),
    ).toBe(true);
  });

  it('lintExtraction reste muet quand les alinéas sont minoritaires', () => {
    const verdict = lintExtraction({
      category: 'business',
      facts: [],
      actions: [
        "Accéder au guichet des formalités des entreprises et lancer la demande d'immatriculation au plus tôt 1 mois avant le début d'activité.",
        "Préparer le dossier d'immatriculation : pièce d'identité, justificatif de domiciliation, déclaration de non-condamnation.",
        "Joindre une copie de la pièce d'identité de l'entrepreneur.",
      ],
    });
    expect(
      verdict.flags.some((f: string) => f.includes('alinéas de dossier')),
    ).toBe(false);
  });
});
