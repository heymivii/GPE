import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('global_search_index')
export class GlobalSearchIndex {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('idx_global_search_index_category')
  @Column({ type: 'text' })
  category: string;

  @Index('idx_global_search_index_entity_id')
  @Column({ name: 'entity_id', type: 'text' })
  entityId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  extra: string | null;

  @Column({ type: 'text', nullable: true })
  url: string | null;

  @Column({ name: 'country_name', type: 'varchar', length: 255, nullable: true })
  countryName: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl: string | null;

  // Maintenu automatiquement par le trigger trg_global_search_vector
  @Index('idx_global_search_index_search_vector', { spatial: false })
  @Column({ name: 'search_vector', type: 'tsvector', nullable: true, select: false, insert: false, update: false })
  searchVector: unknown;
}
