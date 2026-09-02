import * as fs from 'fs';
import * as path from 'path';
import { DocumentStorageService } from './document-storage.service';

describe('DocumentStorageService (chiffrement au repos)', () => {
  let svc: DocumentStorageService;

  beforeEach(() => {
    // ConfigService mock → pas de clé env → clé de dev déterministe.
    svc = new DocumentStorageService({ get: () => undefined } as any);
  });

  it('chiffre puis déchiffre à l’identique (round-trip)', async () => {
    const key = svc.newStorageKey();
    const data = Buffer.from('contenu confidentiel du passeport 🛂');
    await svc.write(key, data);

    // Le fichier sur disque ne doit PAS contenir le clair.
    const onDisk = fs.readFileSync(
      path.join(process.cwd(), 'storage', 'documents', `${key}.enc`),
    );
    expect(onDisk.includes(Buffer.from('confidentiel'))).toBe(false);

    const out = await svc.read(key);
    expect(out.equals(data)).toBe(true);
    await svc.delete(key);
  });

  it('détecte toute altération du fichier (auth tag GCM)', async () => {
    const key = svc.newStorageKey();
    await svc.write(key, Buffer.from('x'.repeat(64)));
    const p = path.join(process.cwd(), 'storage', 'documents', `${key}.enc`);
    const blob = fs.readFileSync(p);
    blob[blob.length - 1] ^= 0xff; // corrompt un octet
    fs.writeFileSync(p, blob);

    await expect(svc.read(key)).rejects.toThrow();
    await svc.delete(key);
  });

  it('delete est idempotent (pas d’erreur si absent)', async () => {
    await expect(svc.delete(svc.newStorageKey())).resolves.toBeUndefined();
  });

  it('utilise DOCUMENT_ENCRYPTION_KEY quand une clé hex valide (64 car.) est configurée', async () => {
    const envKeySvc = new DocumentStorageService({
      get: () => 'a'.repeat(64),
    } as any);
    const key = envKeySvc.newStorageKey();
    const data = Buffer.from('secret avec clé env');
    await envKeySvc.write(key, data);

    const out = await envKeySvc.read(key);
    expect(out.equals(data)).toBe(true);
    await envKeySvc.delete(key);
  });
});
