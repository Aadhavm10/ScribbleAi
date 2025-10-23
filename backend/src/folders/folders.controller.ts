import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import type { CreateFolderDto, UpdateFolderDto } from './folders.service';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  async createFolder(@Body() createFolderDto: CreateFolderDto) {
    return this.foldersService.createFolder(createFolderDto);
  }

  @Get()
  async getFolders(@Query('userId') userId: string) {
    return this.foldersService.getFolders(userId);
  }

  @Get('tree')
  async getFolderTree(@Query('userId') userId: string) {
    return this.foldersService.getFolderTree(userId);
  }

  @Get(':id')
  async getFolderById(@Param('id') id: string) {
    return this.foldersService.getFolderById(id);
  }

  @Put(':id')
  async updateFolder(
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.foldersService.updateFolder(id, updateFolderDto);
  }

  @Delete(':id')
  async deleteFolder(@Param('id') id: string) {
    return this.foldersService.deleteFolder(id);
  }

  @Post('move-notes')
  async moveNotesToFolder(
    @Body() body: { noteIds: string[]; folderId: string | null },
  ) {
    return this.foldersService.moveNotesToFolder(body.noteIds, body.folderId);
  }
}

