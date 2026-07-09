import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Partner } from './partner.entity';

@Entity('res_users')
export class User extends BaseEntity {
  @OneToOne(() => Partner, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @Column({ name: 'partner_id' })
  partnerId: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  login: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'must_change_password', type: 'boolean', default: true })
  mustChangePassword: boolean;

  @Column({ type: 'boolean', default: false })
  active: boolean;

  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil: Date | null;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @Column({
    name: 'password_reset_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordResetTokenHash: string | null;

  @Column({
    name: 'password_reset_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  passwordResetExpiresAt: Date | null;
}
