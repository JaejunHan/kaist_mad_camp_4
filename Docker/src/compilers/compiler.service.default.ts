import { Injectable } from '@nestjs/common';
import { ImagesDto } from 'src/images/dto/images.dto';
import { Execution } from 'src/compilers/executes/Execution';
import { v1 } from 'uuid';
import { CompilerService } from './compiler.service';
import { ContainerServiceDefault } from './container.service.default';
import { ImagesService } from '../images/images.service';
import { DockerImage } from 'src/images/entities/dockerimage.entity';
import { Tag } from 'src/images/entities/tag.entity';
import { TagsService } from 'src/images/tags.service';
import axios from 'axios';

@Injectable()
export class CompilerServiceDefault implements CompilerService {
  TIME_OUT = 20000;

  containerService: ContainerServiceDefault;

  constructor(
    containerService: ContainerServiceDefault,
    private imagesService: ImagesService,
    private tagsService: TagsService,
  ) {
    this.containerService = containerService;
    this.imagesService = imagesService;
    this.tagsService = tagsService;
  }

  async compile(execution: Execution) {
    // Build Image
    if (
      execution.imageId == null ||
      this.imagesService.find(execution.imageId) == null
    ) {
      console.log('Randomly Generate imageID & Tag ID');
      execution.imageId = v1().toString();
      execution.tagId = 'latest';
      console.log(
        'No Image Found. Build new image named: ' + execution.imageId,
      );
      await this.builderImage(execution);
    }
    // Run code
    // if (
    //   execution.tagId == null ||(await this.tagsService.containsByImage(execution.imageId, execution.tagId))
    // ) {
    //   execution.tagId = v1().toString();
    // }

    await this.runCode(
      execution.imageId,
      execution.tagId,
      execution.containerId,
    );

    const instance = axios.create({
      // baseURL: process.env.VUE_APP_API_URL,
      baseURL: 'http://192.249.18.218:80',
    });
    if (execution.answerId == null) {
      console.log('quetion!!');
      instance.put('/user/question/setdocker', {
        imageId: execution.imageId,
        tagId: execution.tagId,
        containerId: execution.containerId,
        language: execution.getLanguage(),
        questionId: execution.questionId,
        answerId: execution.answerId,
      });
    } else {
      console.log('answer!!');
      instance.put('/user/answer/setdocker', {
        imageId: execution.imageId,
        tagId: execution.tagId,
        containerId: execution.containerId,
        language: execution.getLanguage(),
        questionId: execution.questionId,
        answerId: execution.answerId,
      });
    }
    // const question = await fetchQuestion(this.$route.params.questionId);

    /////////
  }

  private async builderImage(execution: Execution) {
    execution.createExecutionDirectory();
    console.log(
      'Creating execution directory: ' + execution.getExecutionFolderName(),
    );
    console.log('Building the docker image: ' + execution.getImageName());

    try {
      this.containerService.buildImage(execution.path, execution.imageId);
      console.log('Container image has been built');
      const imageDto: DockerImage = new DockerImage();
      imageDto.id = execution.imageId;
      imageDto.language = execution.getLanguage();
      await this.imagesService.create(imageDto);
    } catch (error) {
      // ContainerFailedDependency Exception
      console.warn('Error while building container image: {}', error);
      throw error;
    }
    /*finally {
      try {
        execution.deleteExecutionDirectory();
        console.log('Execution directory has been deleted');
      } catch (error) {
        console.warn(
          'Error while trying to delete execution directory, {}',
          error,
        );
      }
    }*/
  }

  private async runCode(
    imageName: string,
    tagName: string,
    containerName: string,
  ) {
    try {
      this.containerService.runContainer(
        imageName,
        tagName,
        containerName,
        this.TIME_OUT,
      );
      console.log('Run container success!');

      //const tag: Tag = new Tag();
      //tag.id = tagName;
      //console.log('imageName : ' + imageName);
      //tag.dockerImage = await this.imagesService.find(imageName);
      //await this.tagsService.saveTag(tag);
    } catch (error) {
      throw error;
    }
  }
}
