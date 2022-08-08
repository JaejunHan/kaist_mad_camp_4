import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(@InjectRepository(Tag) private tagsRepository: Repository<Tag>) {
    this.tagsRepository = tagsRepository;
  }

  async saveTag(tag: Tag) {
    await this.tagsRepository.save(tag);
  }

  async deleteTag(tag: Tag) {
    await this.tagsRepository.delete(tag);
  }

  async containsByImage(imageId: string, tagId: string) {
    const result = await this.tagsRepository.findOne({
      loadRelationIds: {
        relations: [
          'docker_image',
        ],
        disableMixedMap: true
      },
      where: {
        id: tagId
    }})
    if (result == null) {
      console.log("Invalid Tag Id");
      return false;
    }

    if (result.dockerImage.id == imageId) {
      return true;
    } else {
      console.log("Tag ID doesn't match to docker image");
      return false;
    }
  }
}
