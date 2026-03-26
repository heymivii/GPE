import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({name: 'language'})
export class Language {
    @PrimaryGeneratedColumn({ name: 'id_language'})
    id_language: number

    @Column({ name: 'language_name', type: 'varchar', length: 100})
    name: string;
}