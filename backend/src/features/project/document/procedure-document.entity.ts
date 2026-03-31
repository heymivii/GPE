import { AdminProcedure } from 'src/features/admin-procedure/entities/admin-procedure.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Document } from './document.entity';

@Entity('procedure_document')
export class ProcedureDocument {
  @PrimaryColumn({ name: 'admin_procedure_id' })
  idAdminProcedure: number;

  @PrimaryColumn({ name: 'document_id' })
  idDocument: number;

  @ManyToOne(() => AdminProcedure)
  @JoinColumn({ name: 'admin_procedure_id' })
  procedure: AdminProcedure;

  @ManyToOne(() => Document)
  @JoinColumn({ name: 'document_id' })
  document: Document;
}
