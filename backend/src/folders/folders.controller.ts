import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import type { CreateFolderDto, UpdateFolderDto } from './folders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  async createFolder(@Body() createFolderDto: Omit<CreateFolderDto, 'userId'>, @CurrentUser() user: any) {
    return this.foldersService.createFolder({ ...createFolderDto, userId: user.id });
  }

  @Get()
  async getFolders(@CurrentUser() user: any) {
    return this.foldersService.getFolders(user.id);
  }

  @Get('tree')
  async getFolderTree(@CurrentUser() user: any) {
    return this.foldersService.getFolderTree(user.id);
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

