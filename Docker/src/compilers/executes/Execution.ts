import { v1 } from 'uuid';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  copyFileSync,
  rmdirSync,
} from 'fs';
import { CompileRequestDto } from 'src/compilers/dto/compile.request.dto';

export abstract class Execution {
  IMAGE_PREFIX_NAME = 'image-';
  EXECUTION_FOLDER_PREFIX_NAME = 'execution-';
  EXECUTION_VOLUME_PREFIX_NAME = 'volume-';

  TIME_LIMIT;
  MEMORY_LIMIT;

  imageId: string;
  tagId: string;
  containerId: string;
  questionId: string;
  answerId: string;
  path: string;

  constructor(req: CompileRequestDto) {
    this.imageId = req.imageId;
    this.tagId = req.tagId;
    this.containerId = v1().toString();
    this.questionId = req.questionId;
    this.answerId = req.answerId;

    this.path = 'data' + '/' + this.imageId;
  }

  createExecutionDirectory() {
    if (!existsSync(this.path)) {
      mkdirSync(this.path, { recursive: true });
      console.log('Saving uploaded files');
    }
    this._saveUploadedFiles();
    console.log('Copying Dockerfile to execution directory');
    this._copyDockerFileToExecutionDirectory();
  }

  deleteExecutionDirectory(): void {
    rmdirSync(this.path, { recursive: true });
  }

  getExecutionVolumeName() {
    return this.EXECUTION_VOLUME_PREFIX_NAME + this.imageId;
  }

  getExecutionFolderName() {
    return this.EXECUTION_FOLDER_PREFIX_NAME + this.imageId;
  }

  getImageName() {
    return this.IMAGE_PREFIX_NAME + this.imageId;
  }

  getTagName() {
    return this.tagId;
  }

  getContainerName() {
    return this.containerId;
  }

  _saveUploadedFiles(): void {
    //copyFileSync('src/main.py', this.path + '/main.py');
  }

  _copyDockerFileToExecutionDirectory() {
    copyFileSync(
      'src/dockerfiles/' + this.getLanguage() + '_dockerfile',
      this.path + '/dockerfile',
    );
  }

  abstract getLanguage(): string;
}
