import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'currency'})
export class Currency {
    @PrimaryGeneratedColumn({ name: 'id_currency'})
    id_currency: number

    @Column({ name: 'code', type: 'varchar', length: 10})
    code: string;

    @Column({ name: 'symbol', type: 'varchar', length: 10})
    symbol: string;
}