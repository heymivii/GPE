import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CostOfLivingService } from './cost-of-living.service';
import { CreateCostOfLivingDto } from './dto/create-cost-of-living.dto';
import { UpdateCostOfLivingDto } from './dto/update-cost-of-living.dto';

@Controller('cost-of-living')
export class CostOfLivingController {
  constructor(private readonly costOfLivingService: CostOfLivingService) {}

  @Post()
  create(@Body() createCostOfLivingDto: CreateCostOfLivingDto) {
    return this.costOfLivingService.create(createCostOfLivingDto);
  }

  @Get()
  findAll() {
    return this.costOfLivingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.costOfLivingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCostOfLivingDto: UpdateCostOfLivingDto) {
    return this.costOfLivingService.update(+id, updateCostOfLivingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.costOfLivingService.remove(+id);
  }
}
