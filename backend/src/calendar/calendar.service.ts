import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RRule } from 'rrule';

export interface CreateCalendarDto {
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  userId: string;
}

export interface UpdateCalendarDto {
  name?: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  isVisible?: boolean;
  syncEnabled?: boolean;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  location?: string;
  color?: string;
  startDate: Date | string;
  endDate: Date | string;
  isAllDay?: boolean;
  timezone?: string;
  recurrenceRule?: string;
  recurrenceEnd?: Date | string;
  calendarId: string;
  userId: string;
  linkedNoteId?: string;
  tagIds?: string[];
  reminderMinutes?: number[];
  attendees?: Array<{ email: string; name?: string; status?: string }>;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  location?: string;
  color?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  isAllDay?: boolean;
  timezone?: string;
  recurrenceRule?: string;
  recurrenceEnd?: Date | string;
  calendarId?: string;
  linkedNoteId?: string;
  tagIds?: string[];
  reminderMinutes?: number[];
  attendees?: Array<{ email: string; name?: string; status?: string }>;
}

export interface EventQueryDto {
  calendarIds?: string[];
  startDate?: Date | string;
  endDate?: Date | string;
  tagIds?: string[];
  search?: string;
}

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== Calendar Operations ====================

  async createCalendar(data: CreateCalendarDto) {
    // If this is set as default, unset other defaults for this user
    if (data.isDefault) {
      await this.prisma.calendar.updateMany({
        where: { userId: data.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.calendar.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || '#3B82F6',
        isDefault: data.isDefault || false,
        userId: data.userId,
      },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });
  }

  async getUserCalendars(userId: string) {
    return this.prisma.calendar.findMany({
      where: { userId },
      include: {
        _count: {
          select: { events: true },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async getCalendar(id: string, userId: string) {
    const calendar = await this.prisma.calendar.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    return calendar;
  }

  async updateCalendar(id: string, userId: string, data: UpdateCalendarDto) {
    // Verify calendar belongs to user
    await this.getCalendar(id, userId);

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.calendar.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.calendar.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { events: true },
        },
      },
    });
  }

  async deleteCalendar(id: string, userId: string) {
    // Verify calendar belongs to user
    await this.getCalendar(id, userId);

    // Delete calendar (events will be cascaded)
    return this.prisma.calendar.delete({
      where: { id },
    });
  }

  async getOrCreateDefaultCalendar(userId: string) {
    let calendar = await this.prisma.calendar.findFirst({
      where: { userId, isDefault: true },
    });

    if (!calendar) {
      calendar = await this.createCalendar({
        name: 'My Calendar',
        color: '#3B82F6',
        isDefault: true,
        userId,
      });
    }

    return calendar;
  }

  // ==================== Event Operations ====================

  async createEvent(data: CreateEventDto) {
    const { tagIds, ...eventData } = data;

    // Validate dates
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Validate recurrence rule if provided
    if (eventData.recurrenceRule) {
      try {
        RRule.fromString(eventData.recurrenceRule);
      } catch (error) {
        throw new BadRequestException('Invalid recurrence rule');
      }
    }

    const event = await this.prisma.calendarEvent.create({
      data: {
        ...eventData,
        startDate,
        endDate,
        recurrenceEnd: eventData.recurrenceEnd ? new Date(eventData.recurrenceEnd) : null,
        timezone: eventData.timezone || 'UTC',
        isAllDay: eventData.isAllDay || false,
        reminderMinutes: eventData.reminderMinutes || [15],
        attendees: eventData.attendees || [],
        tags: tagIds
          ? {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        calendar: true,
        linkedNote: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return event;
  }

  async getEvents(userId: string, query: EventQueryDto) {
    const where: any = { userId };

    // Filter by calendar IDs
    if (query.calendarIds && query.calendarIds.length > 0) {
      where.calendarId = { in: query.calendarIds };
    }

    // Filter by date range
    if (query.startDate && query.endDate) {
      where.AND = [
        { startDate: { lte: new Date(query.endDate) } },
        { endDate: { gte: new Date(query.startDate) } },
      ];
    } else if (query.startDate) {
      where.startDate = { gte: new Date(query.startDate) };
    } else if (query.endDate) {
      where.endDate = { lte: new Date(query.endDate) };
    }

    // Filter by tags
    if (query.tagIds && query.tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: { in: query.tagIds },
        },
      };
    }

    // Search in title and description
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.calendarEvent.findMany({
      where,
      include: {
        calendar: true,
        linkedNote: {
          select: {
            id: true,
            title: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async getEvent(id: string, userId: string) {
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id, userId },
      include: {
        calendar: true,
        linkedNote: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async updateEvent(id: string, userId: string, data: UpdateEventDto) {
    // Verify event belongs to user
    await this.getEvent(id, userId);

    const { tagIds, ...eventData } = data;

    // Validate dates if provided
    if (eventData.startDate || eventData.endDate) {
      const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
      const startDate = eventData.startDate
        ? new Date(eventData.startDate)
        : event!.startDate;
      const endDate = eventData.endDate ? new Date(eventData.endDate) : event!.endDate;

      if (startDate >= endDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Validate recurrence rule if provided
    if (eventData.recurrenceRule) {
      try {
        RRule.fromString(eventData.recurrenceRule);
      } catch (error) {
        throw new BadRequestException('Invalid recurrence rule');
      }
    }

    // Update event
    const updateData: any = {
      ...eventData,
      startDate: eventData.startDate ? new Date(eventData.startDate) : undefined,
      endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
      recurrenceEnd: eventData.recurrenceEnd
        ? new Date(eventData.recurrenceEnd)
        : undefined,
    };

    // Handle tag updates
    if (tagIds !== undefined) {
      // Delete existing tags
      await this.prisma.eventTag.deleteMany({
        where: { eventId: id },
      });

      // Create new tags
      if (tagIds.length > 0) {
        updateData.tags = {
          create: tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        };
      }
    }

    return this.prisma.calendarEvent.update({
      where: { id },
      data: updateData,
      include: {
        calendar: true,
        linkedNote: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async deleteEvent(id: string, userId: string) {
    // Verify event belongs to user
    await this.getEvent(id, userId);

    return this.prisma.calendarEvent.delete({
      where: { id },
    });
  }

  async duplicateEvent(id: string, userId: string) {
    const originalEvent = await this.getEvent(id, userId);

    // Create duplicate event (1 hour after original)
    const startDate = new Date(originalEvent.startDate);
    startDate.setHours(startDate.getHours() + 1);

    const endDate = new Date(originalEvent.endDate);
    endDate.setHours(endDate.getHours() + 1);

    const duplicateData: CreateEventDto = {
      title: `${originalEvent.title} (Copy)`,
      description: originalEvent.description || undefined,
      location: originalEvent.location || undefined,
      color: originalEvent.color || undefined,
      startDate,
      endDate,
      isAllDay: originalEvent.isAllDay,
      timezone: originalEvent.timezone,
      calendarId: originalEvent.calendarId,
      userId,
      linkedNoteId: originalEvent.linkedNoteId || undefined,
      tagIds: originalEvent.tags.map((t) => t.tagId),
      reminderMinutes: originalEvent.reminderMinutes,
      attendees: originalEvent.attendees as any,
    };

    return this.createEvent(duplicateData);
  }

  // ==================== Recurring Events ====================

  expandRecurringEvents(
    events: any[],
    startDate: Date,
    endDate: Date,
  ): any[] {
    const expanded: any[] = [];

    for (const event of events) {
      if (!event.recurrenceRule) {
        // Non-recurring event
        expanded.push(event);
      } else {
        // Recurring event - expand occurrences
        try {
          const rule = RRule.fromString(event.recurrenceRule);
          const occurrences = rule.between(startDate, endDate, true);

          const eventDuration =
            new Date(event.endDate).getTime() - new Date(event.startDate).getTime();

          for (const occurrence of occurrences) {
            expanded.push({
              ...event,
              id: `${event.id}_${occurrence.getTime()}`,
              originalEventId: event.id,
              startDate: occurrence,
              endDate: new Date(occurrence.getTime() + eventDuration),
              isRecurringInstance: true,
            });
          }
        } catch (error) {
          // If rule parsing fails, just include the original event
          expanded.push(event);
        }
      }
    }

    return expanded;
  }
}
