import { CommitRequestDto } from 'src/compilers/dto/commit.request.dto';
import { Injectable } from '@nestjs/common';
import { ContainerService } from './container.service';
import { exec, execSync, spawn, spawnSync } from 'child_process';
import { existsSync, mkdirSync, openSync } from 'fs';
import { v1 } from 'uuid';
import axios from 'axios';

@Injectable()
export class ContainerServiceDefault implements ContainerService {
  BUILD_TIMEOUT = 5 * 60000; // 5 minutes
  COMMAND_TIMEOUT = 2000;

  buildImage(folder: string, imageName: string) {
    //process.chdir(folder);
    let buildCommand = 'docker';
    let buildArgs: string[] = ['build', '-t', imageName, folder];

    //if (!existsSync('requirements.txt')) {
    //openSync('requirements.txt', 'w');
    //}

    let result = spawnSync(buildCommand, buildArgs);
    if (result.status == 0) {
      console.log(result.stdout.toString());
      console.log('Image build success!');
    } else {
      console.log(result.stderr.toString());
      throw 'Image build failed';
    }
  }

  runContainer(
    imageName: string,
    tagName: string,
    containerName: string,
    timeout: number,
  ) {
    console.log('image :' + imageName);
    console.log('tag : ' + tagName);
    let dockerCommand = 'docker';
    let dockerArgs: string[] = [
      'run',
      '-dit',
      '-p',
      '5280:22',
      '--name',
      containerName,
      '-w',
      '/usr/src/app',
      tagName == null ? imageName : imageName + ':' + tagName,
    ];

    let result = spawnSync(dockerCommand, dockerArgs);
    if (result.status == 0) {
      console.log('container name:' + result.stdout.toString());
      console.log('run success!');
    } else {
      console.log('container name err:' + result.stderr.toString());
      //throw 'Container run failed';
      console.log('Container Run Failed');
    }

    let execResult = spawnSync('docker', [
      'exec',
      containerName,
      'service',
      'ssh',
      'start',
    ]);
    if (result.status == 0) {
      console.log(execResult.stdout.toString());
      console.log('ssh start success!');
    } else {
      console.log(execResult.stderr.toString());
      throw 'SSH start failed';
    }
  }

  uploadFileToContainer(srcDir: string, destDir: string) {
    let command = 'docker';
    let args: string[] = ['cp', srcDir, destDir];

    spawnSync(command, args);
    console.log('cp success!');
  }

  commitContainer(req: CommitRequestDto): string {
    // if (req.answerId != null) {
    //   req.tagId = 'latest';
    // } else {
    //   req.tagId = req.tagId == 'null' ? v1().toString() : req.tagId;
    // }
    if (req.answerId == null) {
      req.tagId = 'latest';
    } else {
      req.tagId = req.tagId == 'latest' || 'null' ? v1().toString() : req.tagId;
    }

    let dockerCommand = 'docker';
    let dockerArgs: string[] = [
      'commit',
      req.containerId,
      req.answerId != null ? req.imageId + ':' + req.tagId : req.imageId,
    ];

    spawnSync(dockerCommand, dockerArgs);
    console.log('commit success: ' + req.imageId + ':' + req.tagId);

    // Update
    const instance = axios.create({
      // baseURL: process.env.VUE_APP_API_URL,
      baseURL: 'http://192.249.18.218:80',
    });
    if (req.answerId == null) {
      console.log('quetion!!');
      instance.put('/user/question/setdocker', {
        imageId: req.imageId,
        tagId: req.tagId,
        containerId: req.containerId,
        language: req.language,
        questionId: req.questionId,
        answerId: req.answerId,
      });
    } else {
      console.log('answer!!');
      instance.put('/user/answer/setdocker', {
        imageId: req.imageId,
        tagId: req.tagId,
        containerId: req.containerId,
        language: req.language,
        questionId: req.questionId,
        answerId: req.answerId,
      });
    }

    return req.tagId;
  }

  stopContainer(containerName: string) {
    let command: string = 'docker';
    let args: string[] = ['stop', containerName];

    let result = spawnSync(command, args);
    console.log(result.stdout.toString());
    console.log(result.stderr.toString());
    console.log('stop Container success');
  }

  deleteContainer(containerName: string) {
    let command: string = 'docker';
    let args: string[] = ['rm', containerName];

    let result = spawnSync(command, args);
    console.log(result.stdout.toString());
    console.log(result.stderr.toString());
    console.log('remove Container success');
  }

  execCommand(containerName: string, command: string[]): string {
    let dockerCommand: string = 'docker';
    let args: string[] = ['exec', containerName].concat(command);

    let result = spawnSync(dockerCommand, args);
    console.log(result.stdout.toString());
    console.log(result.stderr.toString());
    return result.stdout.toString();
  }

  getRunningContainer() {
    let command: string = 'docker';
    let args: string[] = ['ps'];

    let result = spawnSync(command, args);
    console.log(result.stdout.toString());
    console.log('get containers success');
  }

  getImages() {
    let command: string = 'docker';
    let args: string[] = ['images'];

    let result = spawnSync(command, args);
    console.log(result.stdout.toString());
    console.log('get image success');
  }

  deleteImage(imageName: string) {
    let command: string = 'docker';
    let args: string[] = ['rmi', '-f', imageName];

    spawnSync(command, args);
    console.log('delete image success');
  }
}
