import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    UNSUBSCRIBED = 'UNSUBSCRIBED',
}

@Entity('newsletter_subscriber')
export class NewsletterSubscriber {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.ACTIVE,
    })
    status: SubscriptionStatus;

    @Column({ default: 'landing_page' })
    source: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
