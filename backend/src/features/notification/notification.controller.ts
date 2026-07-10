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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notification')
@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Request() req, @Body() createNotificationDto: CreateNotificationDto) {
    // Le destinataire est forcé à l'utilisateur authentifié — on ignore tout userId du body.
    return this.notificationService.create({
      ...createNotificationDto,
      userId: req.user.userId,
    });
  }

  @Get()
  findAll(@Request() req) {
    return this.notificationService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.notificationService.findOne(+id, req.user.userId);
  }

  // Déclaré AVANT les routes ':id' pour ne pas être capturé comme un paramètre.
  @Patch('read-all')
  markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }

  @Patch(':id/read')
  markAsRead(@Request() req, @Param('id') id: string) {
    return this.notificationService.markAsRead(+id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(
      +id,
      req.user.userId,
      updateNotificationDto,
    );
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.notificationService.remove(+id, req.user.userId);
  }
}
