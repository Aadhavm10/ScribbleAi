import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { NotesService } from './notes.service';
import type { CreateNoteDto, UpdateNoteDto } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async list(@Query('userId') userId: string) {
    return this.notesService.listNotesByUser(userId);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.notesService.getNoteById(id);
  }

  @Post()
  async create(@Body() body: CreateNoteDto) {
    return this.notesService.createNote(body);
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


