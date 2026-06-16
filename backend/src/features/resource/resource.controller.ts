import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminLogService } from '../admin-log/admin-log.service';

@ApiTags('Resource')
@Controller('resource')
export class ResourceController {
  constructor(
    private readonly resourceService: ResourceService,
    private readonly adminLogService: AdminLogService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createResourceDto: CreateResourceDto, @Request() req) {
    const resource = await this.resourceService.create(createResourceDto);
    await this.adminLogService.log(
      req.user.userId,
      'CREATE',
      'Resource',
      resource.idResource.toString(),
      `Création de la ressource "${resource.title}"`
    );
    return resource;
  }

  @Get()
  findAll(@Query('countryId') countryId?: string) {
    if (countryId) {
      return this.resourceService.findByCountry(+countryId);
    }
    return this.resourceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourceService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
    @Request() req,
  ) {
    const resource = await this.resourceService.update(+id, updateResourceDto);
    await this.adminLogService.log(
      req.user.userId,
      'UPDATE',
      'Resource',
      resource.idResource.toString(),
      `Modification de la ressource "${resource.title}"`
    );
    return resource;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string, @Request() req) {
    const resource = await this.resourceService.findOne(+id);
    await this.resourceService.remove(+id);
    await this.adminLogService.log(
      req.user.userId,
      'DELETE',
      'Resource',
      id,
      `Suppression de la ressource "${resource.title}"`
    );
  }
}
