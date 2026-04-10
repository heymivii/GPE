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
import { ApiTags } from '@nestjs/swagger';

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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id') id: string) {
    await this.projectService.remove(+id, req.user.userId);
  }
}
