import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Tag } from './tag.entity';

@Entity()
export class DockerImage {
  @PrimaryColumn()
  id: string;

  @Column()
  language: string;

  @OneToMany(() => Tag, (tag) => tag.dockerImage, { cascade: true })
  tags: Tag[];
}
