import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DockerImage } from './entities/dockerimage.entity';
import { Tag } from './entities/tag.entity';
import { ImagesService } from './images.service';
import { TagsService } from './tags.service';

@Module({
  imports: [TypeOrmModule.forFeature([DockerImage, Tag])],
  controllers: [],
  providers: [ImagesService, TagsService],
  exports: [ImagesService, TagsService],
})
export class ImagesModule {}
