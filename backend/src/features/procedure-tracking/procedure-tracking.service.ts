import { Injectable } from '@nestjs/common';
import { CreateProcedureTrackingDto } from './dto/create-procedure-tracking.dto';
import { UpdateProcedureTrackingDto } from './dto/update-procedure-tracking.dto';

@Injectable()
export class ProcedureTrackingService {
  create(createProcedureTrackingDto: CreateProcedureTrackingDto) {
    return 'This action adds a new procedureTracking';
  }

  findAll() {
    return `This action returns all procedureTracking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} procedureTracking`;
  }

  update(id: number, updateProcedureTrackingDto: UpdateProcedureTrackingDto) {
    return `This action updates a #${id} procedureTracking`;
  }

  remove(id: number) {
    return `This action removes a #${id} procedureTracking`;
  }
}
