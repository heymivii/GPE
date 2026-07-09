import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { DocumentService, UploadedFileLike } from './document.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SIZE, files: 1 },
      fileFilter: (_req, file, cb) => {
        // Premier filtre (type déclaré) ; le contrôle réel (magic bytes) est dans le service.
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Type non autorisé (PDF, JPEG, PNG)'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Req() req: any,
    @UploadedFile() file: UploadedFileLike,
    @Body()
    body: { projectId?: string; procedureTrackingId?: string; docType?: string },
  ) {
    // Projet optionnel (coffre personnel) ; s'il est absent, le document reste au user.
    const projectId = body.projectId
      ? parseInt(body.projectId, 10)
      : undefined;
    const procId = body.procedureTrackingId
      ? parseInt(body.procedureTrackingId, 10)
      : undefined;
    return this.documentService.create(
      req.user.userId,
      Number.isNaN(projectId as number) ? undefined : projectId,
      Number.isNaN(procId as number) ? undefined : procId,
      body.docType,
      file,
    );
  }

  @Get()
  list(
    @Req() req: any,
    @Query('projectId') projectId?: string,
    @Query('procedureTrackingId') procedureTrackingId?: string,
  ) {
    if (procedureTrackingId) {
      return this.documentService.listByProcedure(
        req.user.userId,
        parseInt(procedureTrackingId, 10),
      );
    }
    if (projectId) {
      return this.documentService.listByProject(
        req.user.userId,
        parseInt(projectId, 10),
      );
    }
    // Aucun filtre → tout le coffre personnel de l'utilisateur.
    return this.documentService.listAllByUser(req.user.userId);
  }

  @Get(':id/download')
  async download(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const { doc, data } = await this.documentService.getForDownload(
      id,
      req.user.userId,
    );
    const safeName = doc.originalName.replace(/["\r\n]/g, '_');
    return new StreamableFile(data, {
      type: doc.mimeType,
      disposition: `attachment; filename="${safeName}"`,
      length: data.length,
    });
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.documentService.remove(id, req.user.userId);
  }
}
