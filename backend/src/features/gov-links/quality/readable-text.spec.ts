import {
  toReadableText,
  dropMenuLines,
  stripBoilerplate,
  selectRelevantExcerpt,
} from './readable-text';

describe('toReadableText — la matière première du LLM', () => {
  it('PRÉSERVE la casse (CERFA, CPAM, sigles) — le signal que l’ancienne chaîne détruisait', () => {
    const html =
      '<p>Remplir le formulaire CERFA 14571*06 puis contacter la CPAM.</p>';
    const text = toReadableText(html);
    expect(text).toContain('CERFA 14571*06');
    expect(text).toContain('CPAM');
  });

  it('retire nav / header / footer avec leur contenu', () => {
    const html = `
      <header><a href="/">Accueil</a></header>
      <nav><a>Trouver sa formation</a><a>Préparer son arrivée</a></nav>
      <p>La demande de visa se fait au consulat.</p>
      <footer>Mentions légales</footer>`;
    const text = toReadableText(html);
    expect(text).toContain('La demande de visa se fait au consulat.');
    expect(text).not.toContain('Trouver sa formation');
    expect(text).not.toContain('Mentions légales');
    expect(text).not.toContain('Accueil');
  });

  it('retire un conteneur identifié par sa classe (menu, cookie, breadcrumb)', () => {
    const html =
      '<div class="main-menu"><span>Rubrique A</span></div><p>Contenu utile ici.</p>';
    expect(toReadableText(html)).not.toContain('Rubrique A');
    expect(toReadableText(html)).toContain('Contenu utile ici.');
  });

  it('transforme les listes en puces et les blocs en lignes', () => {
    const html =
      '<h2>Pièces à fournir</h2><ul><li>Passeport en cours de validité</li><li>Justificatif de domicile de moins de 6 mois</li></ul>';
    const text = toReadableText(html);
    expect(text).toContain('Pièces à fournir');
    expect(text).toContain('- Passeport en cours de validité');
  });

  it('décode les entités HTML françaises', () => {
    expect(
      toReadableText('<p>co&ucirc;t&nbsp;: 225&nbsp;&euro;</p>'),
    ).toContain('coût : 225 €');
  });
});

describe('dropMenuLines — résidus de menu, sans tuer les titres', () => {
  it('CONSERVE un titre de section isolé (ligne courte seule)', () => {
    const text =
      'Pièces justificatives\nLe dossier doit comporter un passeport valide.';
    expect(dropMenuLines(text)).toContain('Pièces justificatives');
  });

  it('SUPPRIME une rafale de lignes courtes (résidu de menu)', () => {
    const text = [
      'Accueil',
      'Nos services',
      'Contact',
      'Espace presse',
      'La demande de titre de séjour se fait en ligne.',
    ].join('\n');
    const out = dropMenuLines(text);
    expect(out).toBe('La demande de titre de séjour se fait en ligne.');
  });

  it('conserve les puces même courtes (listes de contenu)', () => {
    const text = '- Passeport\n- Photo d’identité\n- Justificatif de domicile';
    expect(dropMenuLines(text)).toContain('- Passeport');
  });
});

describe('selectRelevantExcerpt — la bonne zone plutôt que le début', () => {
  it('renvoie tel quel un texte sous le plafond', () => {
    expect(selectRelevantExcerpt('court', ['visa'], 8000)).toBe('court');
  });

  it('choisit la fenêtre la plus dense en mots-clés, pas les premiers caractères', () => {
    const filler = 'Actualités générales du gouvernement. '.repeat(300);
    const gold =
      'Le titre de séjour se demande en ligne. Le récépissé de titre de séjour est délivré immédiatement. ' +
      'Le renouvellement du titre de séjour se fait 2 mois avant expiration. '.repeat(
        10,
      );
    const text = filler + gold + filler;
    const excerpt = selectRelevantExcerpt(
      text,
      ['titre de séjour', 'récépissé'],
      3000,
    );
    expect(excerpt.length).toBeLessThanOrEqual(3000);
    // « récépissé » ne vit QUE dans la zone dense : une troncature en tête (11 000
    // caractères de remplissage avant) ne l'aurait jamais contenue.
    expect(excerpt).toContain('récépissé');
    expect(excerpt).toContain('titre de séjour');
  });

  it('retombe sur le début du texte sans mot-clé exploitable', () => {
    const text = 'A'.repeat(10000);
    expect(selectRelevantExcerpt(text, [], 3000)).toHaveLength(3000);
  });
});

describe('stripBoilerplate — robustesse', () => {
  it('supporte une balise non refermée sans avaler le reste', () => {
    const html = '<p>Un</p><br><p>Deux</p>';
    const text = toReadableText(html);
    expect(text).toContain('Un');
    expect(text).toContain('Deux');
  });

  it('ne casse pas sur du HTML vide ou nul', () => {
    expect(stripBoilerplate('')).toBe('');
    expect(toReadableText('')).toBe('');
  });
});
