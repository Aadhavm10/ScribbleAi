import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateFolderDto {
  name: string;
  color?: string;
  icon?: string;
  parentId?: string;
  userId: string;
}

export interface UpdateFolderDto {
  name?: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  private isDbAvailable(): boolean {
    return process.env.SKIP_PRISMA !== 'true';
  }

  async createFolder(data: CreateFolderDto) {
    if (!this.isDbAvailable()) {
      return {
        id: `mock-${Date.now()}`,
        name: data.name,
        color: data.color,
        icon: data.icon,
        parentId: data.parentId ?? null,
        userId: data.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { notes: 0, children: 0 },
      } as any;
    }
    return this.prisma.folder.create({
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon,
        parentId: data.parentId,
        userId: data.userId,
      },
      include: {
        _count: {
          select: { notes: true, children: true },
        },
      },
    });
  }

  async getFolders(userId: string) {
    if (!this.isDbAvailable()) {
      return [];
    }
    return this.prisma.folder.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: true, children: true },
        },
        parent: true,
      },
      orderBy: [{ createdAt: 'asc' }],
    });
  }

  async getFolderById(id: string) {
    if (!this.isDbAvailable()) {
      throw new NotFoundException('Folder not found');
    }
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { updatedAt: 'desc' },
          include: {
            tags: {
              include: { tag: true },
            },
          },
        },
        children: {
          include: {
            _count: {
              select: { notes: true, children: true },
            },
          },
        },
        parent: true,
        _count: {
          select: { notes: true, children: true },
        },
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

  async updateFolder(id: string, data: UpdateFolderDto) {
    if (!this.isDbAvailable()) {
      throw new NotFoundException('Folder not found');
    }
    try {
      return await this.prisma.folder.update({
        where: { id },
        data: {
          name: data.name,
          color: data.color,
          icon: data.icon,
          parentId: data.parentId,
        },
        include: {
          _count: {
            select: { notes: true, children: true },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException('Folder not found');
    }
  }

  async deleteFolder(id: string) {
    if (!this.isDbAvailable()) {
      return { id };
    }
    try {
      // Notes will be set to null (folderId) due to onDelete: SetNull
      await this.prisma.folder.delete({
        where: { id },
      });
      return { id };
    } catch (error) {
      throw new NotFoundException('Folder not found');
    }
  }

  async getFolderTree(userId: string) {
    if (!this.isDbAvailable()) {
      return [];
    }
    const folders = await this.prisma.folder.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: true, children: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Build tree structure
    const folderMap = new Map<string, any>();
    const rootFolders: any[] = [];

    folders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    folders.forEach((folder) => {
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children.push(folderMap.get(folder.id));
        }
      } else {
        rootFolders.push(folderMap.get(folder.id));
      }
    });

    return rootFolders;
  }

  async moveNotesToFolder(noteIds: string[], folderId: string | null) {
    if (!this.isDbAvailable()) {
      return { success: true, count: noteIds.length };
    }
    await this.prisma.note.updateMany({
      where: { id: { in: noteIds } },
      data: { folderId },
    });

    return { success: true, count: noteIds.length };
  }
}

