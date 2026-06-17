import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminLog } from './entities/admin-log.entity';

@Injectable()
export class AdminLogService {
  constructor(
    @InjectRepository(AdminLog)
    private readonly adminLogRepository: Repository<AdminLog>,
  ) {}

  async log(
    userId: number,
    action: string,
    entityType: string,
    entityId: string,
    details?: string,
  ): Promise<AdminLog> {
    const logEntry = this.adminLogRepository.create({
      userId,
      action,
      entityType,
      entityId,
      details,
    });
    return await this.adminLogRepository.save(logEntry);
  }

  async findAll(): Promise<AdminLog[]> {
    return await this.adminLogRepository.find({
      relations: ['user'],
      order: { idAdminLog: 'DESC' },
    });
  }
}
