import { Injectable } from '@nestjs/common';
import { CreateAdminProcedureDto } from './dto/create-admin-procedure.dto';
import { UpdateAdminProcedureDto } from './dto/update-admin-procedure.dto';

@Injectable()
export class AdminProcedureService {
  create(createAdminProcedureDto: CreateAdminProcedureDto) {
    return 'This action adds a new adminProcedure';
  }

  findAll() {
    return `This action returns all adminProcedure`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminProcedure`;
  }

  update(id: number, updateAdminProcedureDto: UpdateAdminProcedureDto) {
    return `This action updates a #${id} adminProcedure`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminProcedure`;
  }
}
