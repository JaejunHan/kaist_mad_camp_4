import { Module } from '@nestjs/common';
import { ImagesModule } from 'src/images/images.module';
import { CompilerController } from './compiler.controller';
import { CompilerServiceDefault } from './compiler.service.default';
import { ContainerServiceDefault } from './container.service.default';

@Module({
  imports: [ImagesModule],
  controllers: [CompilerController],
  providers: [CompilerServiceDefault, ContainerServiceDefault],
})
export class CompilersModule {}
