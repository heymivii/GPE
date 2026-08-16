import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { ForbiddenWord } from './entities/forbidden-word.entity';
import { UserWarning } from './entities/user-warning.entity';
import { User } from '../user/entities/user.entity';
import {
  CreateForbiddenWordDto,
  WordSeverity,
} from './dto/create-forbidden-word.dto';
import { UpdateForbiddenWordDto } from './dto/update-forbidden-word.dto';

/** Résultat d'une passe de modération sur un texte. */
export interface ModerationResult {
  /** ok = rien ; flag = publié mais marqué ; block = refusé. */
  action: 'ok' | 'flag' | 'block';
  reason?: string;
}

const SEVERITY_RANK: Record<WordSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

/** Seuil d'avertissements au-delà duquel un utilisateur remonte aux admins. */
export const WARNING_FLAG_THRESHOLD = 3;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class ForumModerationService {
  constructor(
    @InjectRepository(ForbiddenWord)
    private readonly wordRepository: Repository<ForbiddenWord>,
    @InjectRepository(UserWarning)
    private readonly warningRepository: Repository<UserWarning>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /** Minuscule + suppression des accents, pour matcher « côn », « CON », « con ». */
  private normalize(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  // ── CRUD mots interdits (admin) ─────────────────────────────────────────────

  createWord(dto: CreateForbiddenWordDto): Promise<ForbiddenWord> {
    const word = this.wordRepository.create({
      word: dto.word.trim().toLowerCase(),
      severity: dto.severity ?? 'medium',
      isActive: dto.isActive ?? true,
    });
    return this.wordRepository.save(word);
  }

  listWords(): Promise<ForbiddenWord[]> {
    return this.wordRepository.find({ order: { word: 'ASC' } });
  }

  async updateWord(
    id: number,
    dto: UpdateForbiddenWordDto,
  ): Promise<ForbiddenWord> {
    const word = await this.wordRepository.findOne({
      where: { idForbiddenWord: id },
    });
    if (!word) throw new NotFoundException(`Mot interdit ${id} introuvable`);
    if (dto.word !== undefined) word.word = dto.word.trim().toLowerCase();
    if (dto.severity !== undefined) word.severity = dto.severity;
    if (dto.isActive !== undefined) word.isActive = dto.isActive;
    return this.wordRepository.save(word);
  }

  async removeWord(id: number): Promise<void> {
    const res = await this.wordRepository.delete(id);
    if (!res.affected)
      throw new NotFoundException(`Mot interdit ${id} introuvable`);
  }

  // ── Modération d'un texte à la publication ──────────────────────────────────

  /**
   * Scanne `text` contre les mots interdits actifs. En cas de correspondance,
   * enregistre un avertissement (même si le contenu est bloqué → on trace les
   * tentatives) et renvoie l'action : high/critical = block, low/medium = flag.
   */
  async moderate(userId: number, text: string): Promise<ModerationResult> {
    const active = await this.wordRepository.find({ where: { isActive: true } });
    if (active.length === 0) return { action: 'ok' };

    const haystack = this.normalize(text);
    const matches = active.filter((w) =>
      new RegExp(`\\b${escapeRegExp(this.normalize(w.word))}\\b`).test(
        haystack,
      ),
    );
    if (matches.length === 0) return { action: 'ok' };

    const worst = matches.sort(
      (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity],
    )[0];
    const reason = `Terme signalé « ${worst.word} » (${worst.severity})`;

    await this.recordWarning(userId, worst, reason);

    const action =
      worst.severity === 'high' || worst.severity === 'critical'
        ? 'block'
        : 'flag';
    return { action, reason };
  }

  private async recordWarning(
    userId: number,
    word: ForbiddenWord,
    reason: string,
  ): Promise<void> {
    const warning = this.warningRepository.create({
      user: { idUser: userId } as User,
      forbiddenWord: { idForbiddenWord: word.idForbiddenWord } as ForbiddenWord,
      reason,
    });
    await this.warningRepository.save(warning);
    await this.userRepository.increment({ idUser: userId }, 'warningCount', 1);
  }

  // ── Vues admin : utilisateurs à surveiller ──────────────────────────────────

  /** Utilisateurs ayant au moins `threshold` avertissements (récidivistes). */
  listFlaggedUsers(
    threshold: number = WARNING_FLAG_THRESHOLD,
  ): Promise<User[]> {
    // Le hash du mot de passe est retiré globalement (@Exclude + interceptor).
    return this.userRepository.find({
      where: { warningCount: MoreThanOrEqual(threshold) },
      order: { warningCount: 'DESC' },
    });
  }

  listUserWarnings(userId: number): Promise<UserWarning[]> {
    return this.warningRepository.find({
      where: { user: { idUser: userId } },
      relations: ['forbiddenWord', 'message'],
      order: { createdAt: 'DESC' },
    });
  }
}
