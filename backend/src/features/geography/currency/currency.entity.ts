import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'currency'})
export class Currency {
    @PrimaryGeneratedColumn({ name: 'id'})
    id: number

    @Column({ name: 'code', type: 'varchar', length: 10})
    code: string;

    @Column({ name: 'symbol', type: 'varchar', length: 10})
    symbol: string;
}