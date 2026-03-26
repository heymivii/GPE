import { AdminProcedure } from 'src/features/admin-procedure/entities/admin-procedure.entity';
import {Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('procedure_document')
export class ProcedureDocument {
  @PrimaryColumn({ name: 'id_admin_procedure' })
  idAdminProcedure: number;

  @PrimaryColumn({ name: 'id_document' })
  idDocument: number;

  @ManyToOne(() => AdminProcedure)
  @JoinColumn({ name: 'id_admin_procedure' })
  procedure: AdminProcedure;

  @ManyToOne(() => Document)
  @JoinColumn({ name: 'id_document' })
  document: Document;
}
