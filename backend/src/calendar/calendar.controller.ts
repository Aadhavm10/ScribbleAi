import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { GoogleCalendarService } from './google-calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  // ==================== Calendar Endpoints ====================

  @Get('calendars')
  async listCalendars(@CurrentUser() user: any) {
    return this.calendarService.getUserCalendars(user.id);
  }

  @Get('calendars/:id')
  async getCalendar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.calendarService.getCalendar(id, user.id);
  }

  @Post('calendars')
  async createCalendar(
    @Body()
    body: {
      name: string;
      description?: string;
      color?: string;
      isDefault?: boolean;
    },
    @CurrentUser() user: any,
  ) {
    return this.calendarService.createCalendar({
      ...body,
      userId: user.id,
    });
  }

  @Put('calendars/:id')
  async updateCalendar(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      color?: string;
      isDefault?: boolean;
      isVisible?: boolean;
      syncEnabled?: boolean;
    },
    @CurrentUser() user: any,
  ) {
    return this.calendarService.updateCalendar(id, user.id, body);
  }

  @Delete('calendars/:id')
  async deleteCalendar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.calendarService.deleteCalendar(id, user.id);
  }

  // ==================== Event Endpoints ====================

  @Get('events')
  async listEvents(
    @CurrentUser() user: any,
    @Query('calendarIds') calendarIds?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tagIds') tagIds?: string,
    @Query('search') search?: string,
    @Query('expand') expand?: string,
  ) {
    const query: any = {};

    if (calendarIds) {
      query.calendarIds = calendarIds.split(',');
    }
    if (startDate) {
      query.startDate = new Date(startDate);
    }
    if (endDate) {
      query.endDate = new Date(endDate);
    }
    if (tagIds) {
      query.tagIds = tagIds.split(',');
    }
    if (search) {
      query.search = search;
    }

    const events = await this.calendarService.getEvents(user.id, query);

    // Expand recurring events if requested
    if (expand === 'true' && query.startDate && query.endDate) {
      return this.calendarService.expandRecurringEvents(
        events,
        query.startDate,
        query.endDate,
      );
    }

    return events;
  }

  @Get('events/:id')
  async getEvent(@Param('id') id: string, @CurrentUser() user: any) {
    return this.calendarService.getEvent(id, user.id);
  }

  @Post('events')
  async createEvent(
    @Body()
    body: {
      title: string;
      description?: string;
      location?: string;
      color?: string;
      startDate: string;
      endDate: string;
      isAllDay?: boolean;
      timezone?: string;
      recurrenceRule?: string;
      recurrenceEnd?: string;
      calendarId?: string;
      linkedNoteId?: string;
      tagIds?: string[];
      reminderMinutes?: number[];
      attendees?: Array<{ email: string; name?: string; status?: string }>;
    },
    @CurrentUser() user: any,
  ) {
    // Get or create default calendar if not specified
    let calendarId = body.calendarId;
    if (!calendarId) {
      const defaultCalendar = await this.calendarService.getOrCreateDefaultCalendar(
        user.id,
      );
      calendarId = defaultCalendar.id;
    }

    return this.calendarService.createEvent({
      ...body,
      calendarId,
      userId: user.id,
    });
  }

  @Put('events/:id')
  async updateEvent(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      location?: string;
      color?: string;
      startDate?: string;
      endDate?: string;
      isAllDay?: boolean;
      timezone?: string;
      recurrenceRule?: string;
      recurrenceEnd?: string;
      calendarId?: string;
      linkedNoteId?: string;
      tagIds?: string[];
      reminderMinutes?: number[];
      attendees?: Array<{ email: string; name?: string; status?: string }>;
    },
    @CurrentUser() user: any,
  ) {
    return this.calendarService.updateEvent(id, user.id, body);
  }

  @Delete('events/:id')
  async deleteEvent(@Param('id') id: string, @CurrentUser() user: any) {
    // Delete from Google Calendar if synced
    try {
      await this.googleCalendarService.deleteGoogleEvent(id, user.id);
    } catch (error) {
      // Continue with local deletion even if Google deletion fails
    }

    return this.calendarService.deleteEvent(id, user.id);
  }

  @Post('events/:id/duplicate')
  async duplicateEvent(@Param('id') id: string, @CurrentUser() user: any) {
    return this.calendarService.duplicateEvent(id, user.id);
  }

  // ==================== Google Calendar Sync Endpoints ====================

  @Post('sync/google/import-calendars')
  async importGoogleCalendars(@CurrentUser() user: any) {
    return this.googleCalendarService.importGoogleCalendars(user.id);
  }

  @Post('sync/google/calendar/:calendarId')
  async syncGoogleCalendar(
    @Param('calendarId') calendarId: string,
    @CurrentUser() user: any,
    @Body()
    body: {
      startDate?: string;
      endDate?: string;
    },
  ) {
    const options: any = {};
    if (body.startDate) {
      options.startDate = new Date(body.startDate);
    }
    if (body.endDate) {
      options.endDate = new Date(body.endDate);
    }

    return this.googleCalendarService.syncGoogleCalendarEvents(
      user.id,
      calendarId,
      options,
    );
  }

  @Post('sync/google/event/:eventId')
  async exportEventToGoogle(@Param('eventId') eventId: string, @CurrentUser() user: any) {
    return this.googleCalendarService.exportEventToGoogle(eventId, user.id);
  }
}
