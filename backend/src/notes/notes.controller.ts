import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';
import type { CreateNoteDto, UpdateNoteDto } from './notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async list(@CurrentUser() user: any) {
    return this.notesService.listNotesByUser(user.id);
  }

  @Get('session/:code')
  async getBySessionCode(@Param('code') code: string) {
    const note = await this.notesService.getNoteBySessionCode(code);
    if (!note) {
      throw new NotFoundException('Session not found');
    }
    return note;
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.notesService.getNoteById(id);
  }

  @Post()
  async create(@Body() body: Omit<CreateNoteDto, 'userId'>, @CurrentUser() user: any) {
    return this.notesService.createNote({ ...body, userId: user.id });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateNoteDto) {
    return this.notesService.updateNote(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.notesService.deleteNote(id);
  }
}


