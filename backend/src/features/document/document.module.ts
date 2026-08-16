import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentStorageService } from './document-storage.service';
import { UserDocument } from './entities/user-document.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserDocument, ExpatriationProject])],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentStorageService],
  exports: [DocumentService],
})
export class DocumentModule {}
