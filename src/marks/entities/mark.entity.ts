import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Verification } from './verification.entity';

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

  @ManyToOne(() => Category, { eager: true })
  category: Category;

  @OneToMany(() => Verification, (verification) => verification.mark, {
    cascade: true,
  })
  verifications: Verification[];
}
