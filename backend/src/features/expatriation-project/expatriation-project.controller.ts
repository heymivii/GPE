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

@Controller('expatriation-project')
@UseGuards(JwtAuthGuard)
export class ExpatriationProjectController {
  constructor(
    private readonly projectService: ExpatriationProjectService,
  ) {}

  /**
   * Create a new expatriation project
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req,
    @Body() createDto: CreateExpatriationProjectDto,
  ) {
    return await this.projectService.create(req.user.userId, createDto);
  }

  /**
   * Get all projects for the authenticated user
   */
  @Get()
  async findAll(@Request() req) {
    return await this.projectService.findAllByUser(req.user.userId);
  }

  /**
   * Get project count for the authenticated user
   */
  @Get('count')
  async getCount(@Request() req) {
    const count = await this.projectService.countByUser(req.user.userId);
    return { count };
  }

  /**
   * Get a specific project by ID
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return await this.projectService.findOne(+id, req.user.userId);
  }

  /**
   * Update a project
   */
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateExpatriationProjectDto,
  ) {
    return await this.projectService.update(
      +id,
      req.user.userId,
      updateDto,
    );
  }

  /**
   * Delete a project
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id') id: string) {
    await this.projectService.remove(+id, req.user.userId);
  }
}

