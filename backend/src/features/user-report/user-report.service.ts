import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReport, UserReportStatus } from './entities/user-report.entity';
import { User } from '../user/entities/user.entity';
import { CreateUserReportDto } from './dto/create-user-report.dto';

@Injectable()
export class UserReportService {
  constructor(
    @InjectRepository(UserReport)
    private readonly reportRepository: Repository<UserReport>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    reporterId: number,
    dto: CreateUserReportDto,
  ): Promise<UserReport> {
    if (dto.reportedUserId === reporterId) {
      throw new BadRequestException(
        'Vous ne pouvez pas vous signaler vous-même',
      );
    }

    const reported = await this.userRepository.findOne({
      where: { idUser: dto.reportedUserId },
    });
    if (!reported) {
      throw new NotFoundException('Utilisateur signalé introuvable');
    }

    // Un seul signalement en attente par (rapporteur, signalé).
    const existing = await this.reportRepository.findOne({
      where: {
        reporter: { idUser: reporterId },
        reportedUser: { idUser: dto.reportedUserId },
        status: 'pending',
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Vous avez déjà un signalement en attente sur cet utilisateur',
      );
    }

    const report = this.reportRepository.create({
      reason: dto.reason,
      details: dto.details ?? null,
      reporter: { idUser: reporterId } as User,
      reportedUser: { idUser: dto.reportedUserId } as User,
    });
    return this.reportRepository.save(report);
  }

  findAll(status?: string): Promise<UserReport[]> {
    return this.reportRepository.find({
      where: status ? { status: status as UserReportStatus } : {},
      relations: ['reporter', 'reportedUser', 'moderator'],
      order: { createdAt: 'DESC' },
    });
  }

  async resolve(
    id: number,
    moderatorId: number,
    action: 'resolved' | 'rejected',
    moderatorNote?: string,
  ): Promise<UserReport> {
    const report = await this.reportRepository.findOne({
      where: { idUserReport: id },
    });
    if (!report) {
      throw new NotFoundException(`Signalement ${id} introuvable`);
    }
    report.status = action;
    report.moderatorNote = moderatorNote ?? null;
    report.resolvedAt = new Date();
    report.moderator = { idUser: moderatorId } as User;
    return this.reportRepository.save(report);
  }

  async stats(): Promise<{
    pending: number;
    resolved: number;
    rejected: number;
    total: number;
  }> {
    const [pending, resolved, rejected] = await Promise.all([
      this.reportRepository.count({ where: { status: 'pending' } }),
      this.reportRepository.count({ where: { status: 'resolved' } }),
      this.reportRepository.count({ where: { status: 'rejected' } }),
    ]);
    return { pending, resolved, rejected, total: pending + resolved + rejected };
  }
}
