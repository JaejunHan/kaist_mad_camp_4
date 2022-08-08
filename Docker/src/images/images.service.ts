import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DockerImage } from './entities/dockerimage.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(DockerImage)
    private imagesRepository: Repository<DockerImage>,
  ) {
    this.imagesRepository = imagesRepository;
  }

  async create(dockerImage: DockerImage) {
    const image = await this.imagesRepository.save(dockerImage);
    return image;
  }

  async find(id: string) {
    const result = await this.imagesRepository.findOne({
      where: {
        id: id,
      },
    });
    return result;
  }

  async containsTag(id: string, tagId: string) {
    const image = await this.imagesRepository.findOne({
      relations: ['tags'],
      where: {
        id: id,
        tags: {
          id: tagId,
        },
      },
    });
    return image == null ? false : true;
  }

  async delete(id: string) {
    const deletedImage = await this.imagesRepository.delete({ id: id });
  }
}
