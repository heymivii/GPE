import {
  isLikelyFrench,
  normalizeForMatch,
  contentWords,
  isGrounded,
  groundingRatio,
  ungroundedItems,
} from './grounding';

describe('normalizeForMatch', () => {
  it('neutralise accents, casse et ponctuation', () => {
    expect(normalizeForMatch('Titre de SÉJOUR — préfecture !')).toBe(
      'titre de sejour prefecture',
    );
  });
});

describe('contentWords', () => {
  it('ne garde que les mots porteurs (> 3 lettres, hors mots-outils)', () => {
    expect(contentWords('Vous devez faire une demande de visa')).toEqual([
      'demande',
      'visa',
    ]);
  });
});

describe('isGrounded / groundingRatio', () => {
  const PAGE = `La demande de titre de séjour se fait en ligne sur ce téléservice.
    Préparez votre passeport avec le visa ainsi que l'original de votre acte de naissance.
    La préfecture est l'organisme compétent pour cette démarche.`;

  it('valide un élément fidèlement extrait de la page', () => {
    expect(
      isGrounded(
        'Préparer votre passeport avec le visa et votre acte de naissance',
        normalizeForMatch(PAGE),
      ),
    ).toBe(true);
  });

  it('rejette un élément inventé (aucun recouvrement)', () => {
    expect(
      isGrounded(
        'Souscrire une assurance habitation multirisque obligatoire',
        normalizeForMatch(PAGE),
      ),
    ).toBe(false);
  });

  it('calcule le ratio et liste les éléments non ancrés', () => {
    const items = [
      'La préfecture est l’organisme compétent pour cette démarche.', // ancré
      'Le coût de la vignette OFII est de 200 euros.', // inventé
    ];
    expect(groundingRatio(items, PAGE)).toBe(0.5);
    expect(ungroundedItems(items, PAGE)).toHaveLength(1);
    expect(ungroundedItems(items, PAGE)[0]).toMatch(/OFII/);
  });

  it('reste neutre (1) sans texte de page — un garde-fou muet ne dégrade pas', () => {
    expect(groundingRatio(['Quelque chose'], null)).toBe(1);
    expect(groundingRatio(['Quelque chose'], '')).toBe(1);
  });

  it('reste neutre (1) sans élément à vérifier', () => {
    expect(groundingRatio([], PAGE)).toBe(1);
  });
});

describe('garde de langue — résumés français vs pages étrangères (US/JP/CH-DE)', () => {
  const ENGLISH_PAGE =
    'To apply for a Green Card you must file the form with USCIS. ' +
    'The applicant must provide biometrics and attend an interview with an officer. ' +
    'Processing times vary by service center and category of admission.';

  it('détecte le français et rejette l’anglais', () => {
    expect(
      isLikelyFrench(
        'La demande de titre de séjour se fait en ligne sur le site de la préfecture, avec les pièces justificatives et le formulaire prévu pour les étrangers en France.',
      ),
    ).toBe(true);
    expect(isLikelyFrench(ENGLISH_PAGE)).toBe(false);
  });

  it('reste NEUTRE sur une page non francophone — sinon tout lien US/JP serait dégradé à tort', () => {
    const frenchItems = [
      'Déposer la demande de carte verte auprès de l’USCIS.',
      'Fournir ses données biométriques et se présenter à l’entretien.',
    ];
    expect(groundingRatio(frenchItems, ENGLISH_PAGE)).toBe(1);
    expect(ungroundedItems(frenchItems, ENGLISH_PAGE)).toEqual([]);
  });
});
