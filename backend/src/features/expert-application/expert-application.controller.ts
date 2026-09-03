import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminLogService } from '../admin-log/admin-log.service';
import {
  ExpertApplicationService,
  UploadedFileLike,
} from './expert-application.service';
import { CreateExpertApplicationDto } from './dto/create-expert-application.dto';
import { ReviewExpertApplicationDto } from './dto/review-expert-application.dto';

const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];

@ApiTags('Expert applications')
@Controller('expert-applications')
export class ExpertApplicationController {
  constructor(
    private readonly applicationService: ExpertApplicationService,
    private readonly adminLog: AdminLogService,
  ) {}

  @ApiOperation({ summary: 'Postuler au statut d’expert vérifié' })
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('diploma', {
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
    @Request() req,
    @UploadedFile() diploma: UploadedFileLike,
    @Body() dto: CreateExpertApplicationDto,
  ) {
    return this.applicationService.create(req.user.userId, dto, diploma);
  }

  @ApiOperation({ summary: 'Mes candidatures' })
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(@Request() req) {
    return this.applicationService.findMine(req.user.userId);
  }

  @ApiOperation({ summary: 'Nombre de candidatures en attente (Admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('pending-count')
  async pendingCount() {
    return { count: await this.applicationService.countPending() };
  }

  @ApiOperation({ summary: 'Lister les candidatures (Admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query('status') status?: string) {
    return this.applicationService.findAll(status);
  }

  @ApiOperation({ summary: 'Télécharger le justificatif (Admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id/diploma')
  async diploma(@Param('id', ParseIntPipe) id: number) {
    const { buffer, mimeType, filename } =
      await this.applicationService.readDiploma(id);
    return new StreamableFile(buffer, {
      type: mimeType,
      // inline : le modérateur consulte la pièce sans la télécharger.
      disposition: `inline; filename="${encodeURIComponent(filename)}"`,
    });
  }

  @ApiOperation({ summary: 'Accepter ou refuser une candidature (Admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/review')
  async review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewExpertApplicationDto,
    @Request() req,
  ) {
    const application = await this.applicationService.review(
      id,
      dto,
      req.user.userId,
    );

    await this.adminLog.log(
      req.user.userId,
      'UPDATE',
      'ExpertApplication',
      id.toString(),
      `Candidature expert ${dto.status === 'approved' ? 'acceptée' : 'refusée'} : "${application.expertTitle}"`,
    );

    return application;
  }
}
