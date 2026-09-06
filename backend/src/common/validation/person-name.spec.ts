import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from '../../features/auth/dto/register.dto';

/**
 * Retour de recette : « On peut mettre des caractères spéciaux dans le nom et
 * prénom ». Ces tests verrouillent la règle sur le DTO réellement utilisé par
 * POST /auth/register.
 */
async function errorsFor(overrides: Partial<Record<string, unknown>>) {
  const dto = plainToInstance(RegisterDto, {
    firstName: 'Tene',
    lastName: 'Coulibaly',
    email: 'tene@skywalk.com',
    password: 'Password1',
    ...overrides,
  });
  const errors = await validate(dto);
  return { dto, fields: errors.map((e) => e.property) };
}

describe('validation du prénom et du nom', () => {
  it.each([
    ['<script>alert(1)</script>', 'balise HTML / injection'],
    ['Jean123', 'chiffres'],
    ['@@@', 'symboles'],
    ['Jean_Pierre', 'underscore'],
    ['😀', 'emoji'],
    ['-Paul', 'ne commence pas par une lettre'],
    ['A', 'trop court'],
    ['a'.repeat(51), 'dépasse la longueur de la colonne (varchar 50)'],
  ])('refuse « %s » (%s)', async (value) => {
    const { fields } = await errorsFor({ firstName: value });
    expect(fields).toContain('firstName');
  });

  it.each([
    'Jean-Pierre',
    "O'Brien",
    'Anne Marie',
    'José',
    'Müller',
    'Nguyễn',
    'Tené',
    'Éloïse',
  ])('accepte « %s »', async (value) => {
    const { fields } = await errorsFor({ firstName: value, lastName: value });
    expect(fields).not.toContain('firstName');
    expect(fields).not.toContain('lastName');
  });

  it('applique la même règle au nom qu’au prénom', async () => {
    const { fields } = await errorsFor({ lastName: 'Coulibaly<script>' });
    expect(fields).toContain('lastName');
  });

  it('normalise les espaces superflus avant de valider', async () => {
    const { dto } = await errorsFor({ firstName: '  Jean   Pierre  ' });
    expect(dto.firstName).toBe('Jean Pierre');
  });

  it('met l’email en minuscules pour éviter les comptes en double', async () => {
    // « Tene@Mail.COM » et « tene@mail.com » désignent la même boîte : sans
    // normalisation la contrainte unique (sensible à la casse) laisse passer
    // deux comptes.
    const { dto, fields } = await errorsFor({ email: '  Tene@Mail.COM ' });
    expect(dto.email).toBe('tene@mail.com');
    expect(fields).not.toContain('email');
  });

  it.each(['pas-un-email', 'a@', '@b.com', 'a b@c.com'])(
    'refuse l’email invalide « %s »',
    async (email) => {
      const { fields } = await errorsFor({ email });
      expect(fields).toContain('email');
    },
  );
});
