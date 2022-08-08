import { DisconnectRequestDto } from './dto/disconnect.request.dto';
import {
  Bind,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FileInterceptor,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { AppModule } from 'src/app.module';
import { CompileRequestDto } from 'src/compilers/dto/compile.request.dto';
import { CommitRequestDto } from 'src/compilers/dto/commit.request.dto';
import { CExecution } from 'src/compilers/executes/CExecution';
import { Execution } from 'src/compilers/executes/Execution';
import { JavaExecution } from 'src/compilers/executes/JavaExecution';
import { PythonExecution } from 'src/compilers/executes/PythonExecution';
import { CompilerServiceDefault } from './compiler.service.default';
import { NodeExecution } from './executes/NodeExecution';
import { RubyExecution } from './executes/RubyExecution';
import { ContainerServiceDefault } from './container.service.default';

@Controller('compiler')
export class CompilerController {
  constructor(
    private compilerService: CompilerServiceDefault,
    private containerService: ContainerServiceDefault,
  ) {
    this.compilerService = compilerService;
    this.containerService = containerService;
  }

  @Post('compile')
  async compile(@Body() req: CompileRequestDto) {
    var exec: Execution;
    switch (req.language) {
      case 'python':
        exec = new PythonExecution(req);
        break;
      case 'java':
        exec = new JavaExecution(req);
        break;
      case 'c':
        exec = new CExecution(req);
        break;
      case 'node':
        exec = new NodeExecution(req);
        break;
      case 'ruby':
        exec = new RubyExecution(req);
      default:
        throw 'Invalid Language Error';
    }

    this.compilerService.compile(exec);
    return;
  }

  @Get()
  async getInfo() {}

  @Post('commit')
  async commit(@Body() req: CommitRequestDto) {
    if (req.containerId == null || req.imageId == null) {
      throw 'Invalid Commit Request!';
    }
    this.containerService.commitContainer(req);
  }

  @Put('disconnect')
  async disconnect(@Body() req: DisconnectRequestDto) {
    this.containerService.commitContainer(req);
    this.containerService.stopContainer(req.containerId);
    this.containerService.deleteContainer(req.containerId);
  }

  @Get('runningContainer')
  async getRunningContainer() {
    return this.containerService.getRunningContainer();
  }
}
