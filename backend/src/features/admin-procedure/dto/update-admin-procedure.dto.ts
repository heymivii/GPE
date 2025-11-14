import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminProcedureDto } from './create-admin-procedure.dto';

export class UpdateAdminProcedureDto extends PartialType(CreateAdminProcedureDto) {}
