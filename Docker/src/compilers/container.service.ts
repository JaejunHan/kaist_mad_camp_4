import { CommitRequestDto } from 'src/compilers/dto/commit.request.dto';
export interface ContainerService {
  buildImage(folder: string, imageName: string);

  runContainer(
    imageName: string,
    tagName: string,
    containerName: string,
    timeOut: number,
  ); //Process Output

  commitContainer(req: CommitRequestDto): string;

  stopContainer(containerName: string);

  deleteContainer(containerName: string);

  execCommand(containerName: string, command: string[]): string;

  getRunningContainer();

  getImages();

  deleteImage(iamgeName: string);
}
