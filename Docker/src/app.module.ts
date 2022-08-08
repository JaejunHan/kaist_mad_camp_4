import { Module } from '@nestjs/common';
import { CompilersModule } from './compilers/compilers.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DockerImage } from './images/entities/dockerimage.entity';
import { Tag } from './images/entities/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'docker_management_db',
      entities: [DockerImage, Tag],
      synchronize: true,
    }),
    CompilersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
