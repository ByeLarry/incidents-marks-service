import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Verification } from './verification.entity';
import { Category } from '../../categories/entities';

@Entity()
export class Mark {
  @PrimaryGeneratedColumn({ name: 'mark_id' })
  id: number;

  @Column({ type: 'double precision' })
  lng: number;

  @Column({ type: 'double precision' })
  lat: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100 })
  userId: string;

  @Column({ length: 100, nullable: false })
  title: string;

  @Column({ length: 200 })
  description: string;

  @Column({ nullable: true })
  addressName?: string;

  @Column({ nullable: true })
  addressDescription?: string;

  @ManyToOne(() => Category, { eager: true })
  category: Category;

  @OneToMany(() => Verification, (verification) => verification.mark, {
    cascade: true,
  })
  verifications: Verification[];
}
