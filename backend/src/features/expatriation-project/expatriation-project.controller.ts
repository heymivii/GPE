import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExpatriationProjectService } from './expatriation-project.service';
import { CreateExpatriationProjectDto } from './dto/create-expatriation-project.dto';
import { UpdateExpatriationProjectDto } from './dto/update-expatriation-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Expatriation Project')
@Controller('expatriation-project')
@UseGuards(JwtAuthGuard)
export class ExpatriationProjectController {
  constructor(private readonly projectService: ExpatriationProjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req,
    @Body() createDto: CreateExpatriationProjectDto,
  ) {
    return await this.projectService.create(req.user.userId, createDto);
  }

  @Get()
  async findAll(@Request() req) {
    return await this.projectService.findAllByUser(req.user.userId);
  }

  @Get('count')
  async getCount(@Request() req) {
    const count = await this.projectService.countByUser(req.user.userId);
    return { count };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return await this.projectService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateExpatriationProjectDto,
  ) {
    return await this.projectService.update(+id, req.user.userId, updateDto);
  }

  // Débloque le projet (paiement mock) → accès au plan complet.
  @Patch(':id/unlock')
  async unlock(@Request() req, @Param('id') id: string) {
    return await this.projectService.unlock(+id, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id') id: string) {
    await this.projectService.remove(+id, req.user.userId);
  }

  // --- Admin Routes ---

  @ApiOperation({ summary: 'List all expatriation projects (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('admin/all')
  async adminFindAll() {
    return await this.projectService.findAll();
  }

  @ApiOperation({ summary: 'Update any expatriation project (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch('admin/:id')
  async adminUpdate(
    @Param('id') id: string,
    @Body() updateDto: UpdateExpatriationProjectDto,
  ) {
    return await this.projectService.adminUpdate(+id, updateDto);
  }
}
