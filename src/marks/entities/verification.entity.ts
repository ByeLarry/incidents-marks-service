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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Mark, (mark) => mark.verifications)
  mark: Mark;
}
