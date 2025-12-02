import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto, UpdateEventTypeDto } from './event-types.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserId } from '../common/user-id.decorator';

@Controller('event-types')
@UseGuards(JwtAuthGuard)
export class EventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @Post()
  create(@UserId() userId: number, @Body() createDto: CreateEventTypeDto) {
    return this.eventTypesService.create(userId, createDto);
  }

  @Get()
  findAll(@UserId() userId: number) {
    return this.eventTypesService.findAll(userId);
  }

  @Get(':id')
  findOne(@UserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.eventTypesService.findOne(userId, id);
  }

  @Put(':id')
  update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEventTypeDto,
  ) {
    return this.eventTypesService.update(userId, id, updateDto);
  }

  @Delete(':id')
  remove(@UserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.eventTypesService.remove(userId, id);
  }
}
