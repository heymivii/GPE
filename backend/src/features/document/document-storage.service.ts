import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
} from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const IV_LEN = 12; // AES-GCM nonce
const TAG_LEN = 16; // GCM auth tag

/**
 * Stockage de fichiers CHIFFRÉ au repos (AES-256-GCM), hors web-root.
 * Format sur disque : [iv(12) | authTag(16) | ciphertext]. La clé vient de
 * DOCUMENT_ENCRYPTION_KEY (64 hex = 32 octets) ; sinon une clé de DEV est dérivée
 * (avec avertissement) pour que la démo tourne — à NE PAS utiliser en production.
 */
@Injectable()
export class DocumentStorageService {
  private readonly logger = new Logger(DocumentStorageService.name);
  private readonly key: Buffer;
  private readonly dir = path.join(process.cwd(), 'storage', 'documents');

  constructor(config: ConfigService) {
    const envKey = config.get<string>('DOCUMENT_ENCRYPTION_KEY');
    if (envKey && /^[0-9a-fA-F]{64}$/.test(envKey)) {
      this.key = Buffer.from(envKey, 'hex');
    } else {
      this.key = createHash('sha256')
        .update('skywalk-dev-document-key-change-me')
        .digest();
      this.logger.warn(
        '⚠️ DOCUMENT_ENCRYPTION_KEY absente/invalide — clé de DEV utilisée (non sécurisé pour la prod).',
      );
    }
    fs.mkdirSync(this.dir, { recursive: true });
  }

  /** Génère une clé de stockage aléatoire (jamais dérivée d'une entrée utilisateur). */
  newStorageKey(): string {
    return randomUUID();
  }

  async write(storageKey: string, plaintext: Buffer): Promise<void> {
    const iv = randomBytes(IV_LEN);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();
    await fs.promises.writeFile(
      this.pathFor(storageKey),
      Buffer.concat([iv, tag, enc]),
    );
  }

  async read(storageKey: string): Promise<Buffer> {
    const blob = await fs.promises.readFile(this.pathFor(storageKey));
    const iv = blob.subarray(0, IV_LEN);
    const tag = blob.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const enc = blob.subarray(IV_LEN + TAG_LEN);
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag); // lève une erreur si le fichier a été altéré
    return Buffer.concat([decipher.update(enc), decipher.final()]);
  }

  async delete(storageKey: string): Promise<void> {
    await fs.promises.rm(this.pathFor(storageKey), { force: true });
  }

  private pathFor(storageKey: string): string {
    // storageKey est un UUID généré côté serveur → pas de path-traversal possible,
    // mais on garde le basename par sécurité défensive.
    return path.join(this.dir, `${path.basename(storageKey)}.enc`);
  }
}
