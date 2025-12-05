import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserId } from '../common/user-id.decorator';
import { CreateEventDto, UpdateEventDto } from './events.dto';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Post()
  create(@UserId() userId: number, @Body() body: CreateEventDto) {
    return this.events.create(userId, body);
  }

  @Get()
  list(@UserId() userId: number) {
    return this.events.list(userId);
  }

  @Delete(':id')
  remove(@UserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.events.remove(userId, id);
  }

  @Patch(':id')
  update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateEventDto,
  ) {
    return this.events.update(userId, id, body);
  }
}
