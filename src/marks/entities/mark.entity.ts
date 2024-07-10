import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Verification } from './verification.entity';

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

  @Column()
  title: string;

  @Column({ length: 500 })
  description: string;

  // @Column({ default: 0 })
  // verified: number;

  @OneToOne(() => Category)
  @JoinColumn()
  category: Category;

  @OneToMany(() => Verification, (verification) => verification.mark, {
    cascade: true,
  })
  verifications: Verification[];
}
