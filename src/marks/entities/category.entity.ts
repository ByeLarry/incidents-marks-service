import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Mark } from './mark.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  name: string;

  @OneToMany(() => Mark, (mark) => mark.category)
  marks: Mark[];
}
