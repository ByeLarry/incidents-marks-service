import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Mark } from '../../marks/entities';

@Entity()
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true, length: 20 })
  color: string;

  @OneToMany(() => Mark, (mark) => mark.category, {cascade: true})
  marks: Mark[];
}
