import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminProcedure } from './entities/admin-procedure.entity';
import { CreateAdminProcedureDto } from './dto/create-admin-procedure.dto';
import { UpdateAdminProcedureDto } from './dto/update-admin-procedure.dto';

@Injectable()
export class AdminProcedureService {
  constructor(
    @InjectRepository(AdminProcedure)
    private readonly adminProcedureRepository: Repository<AdminProcedure>,
  ) {}

  async create(createDto: CreateAdminProcedureDto): Promise<AdminProcedure> {
    const procedure = this.adminProcedureRepository.create({
      procedureType: createDto.procedureType,
      category: createDto.category,
      stepOrder: createDto.stepOrder,
      description: createDto.description,
      averageDelayDays: createDto.averageDelayDays,
      country: { id: createDto.countryId } as any,
    });
    return await this.adminProcedureRepository.save(procedure);
  }

  async findAll(): Promise<AdminProcedure[]> {
    return await this.adminProcedureRepository.find({
      relations: ['country'],
    });
  }

  async findByCountry(countryId: number): Promise<AdminProcedure[]> {
    return await this.adminProcedureRepository.find({
      where: { country: { id: countryId } },
      relations: ['country'],
    });
  }

  async findOne(id: number): Promise<AdminProcedure> {
    const procedure = await this.adminProcedureRepository.findOne({
      where: { id: id },
      relations: ['country'],
    });
    if (!procedure) {
      throw new NotFoundException(`Procédure administrative avec l'ID ${id} introuvable`);
    }
    return procedure;
  }

  async update(id: number, updateDto: UpdateAdminProcedureDto): Promise<AdminProcedure> {
    const procedure = await this.findOne(id);
    Object.assign(procedure, updateDto);
    return await this.adminProcedureRepository.save(procedure);
  }

  async remove(id: number): Promise<void> {
    const procedure = await this.findOne(id);
    await this.adminProcedureRepository.remove(procedure);
  }
}
