import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DockerImage } from './dockerimage.entity';

@Entity()
export class Tag {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => DockerImage, (dockerImage) => dockerImage.tags)
  @JoinColumn({ name: 'ref_DockerImageId' })
  dockerImage: DockerImage;
}
