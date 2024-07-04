import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Mark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'double precision' })
  lng: number;

  @Column({ type: 'double precision' })
  lat: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  userId: string;

  @Column({})
  title: string;

  @Column({ length: 500 })
  description: string;

  @OneToOne(() => Category)
  @JoinColumn()
  category: Category;
}
