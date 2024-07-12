import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Mark } from './mark.entity';

@Entity()
export class Verification {
  @PrimaryGeneratedColumn({ name: 'verification_id' })
  id: number;

  @Column({ length: 100 })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Mark, (mark) => mark.verifications, {
    onDelete: 'CASCADE',
  })
  mark: Mark;
}
