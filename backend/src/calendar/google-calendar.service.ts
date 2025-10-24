import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { google } from 'googleapis';
import crypto from 'crypto';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private readonly encKey: Buffer | null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const keyB64 = this.config.get<string>('TOKEN_ENCRYPTION_KEY');
    this.encKey = keyB64 ? Buffer.from(keyB64, 'base64') : null;
  }

  private decrypt(b64: string): string {
    if (!this.encKey) return b64;
    const buf = Buffer.from(b64, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encKey, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(data), decipher.final()]);
    return dec.toString('utf8');
  }

  private async getOAuth2Client(userId: string) {
    const acct = await this.prisma.sourceAccount.findFirst({
      where: { userId, provider: 'google' },
    });

    if (!acct) {
      throw new Error('Google account not connected');
    }

    const oAuth2Client = new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
    );

    oAuth2Client.setCredentials({
      access_token: this.decrypt(acct.accessToken),
      refresh_token: this.decrypt(acct.refreshToken),
      expiry_date: acct.expiresAt.getTime(),
    });

    return oAuth2Client;
  }

  async importGoogleCalendars(userId: string) {
    try {
      const auth = await this.getOAuth2Client(userId);
      const calendar = google.calendar({ version: 'v3', auth });

      // Get list of calendars
      const response = await calendar.calendarList.list();
      const googleCalendars = response.data.items || [];

      const imported: any[] = [];

      for (const gcal of googleCalendars) {
        // Check if calendar already exists
        let localCalendar = await this.prisma.calendar.findFirst({
          where: {
            userId,
            googleCalendarId: gcal.id!,
          },
        });

        if (!localCalendar) {
          // Create new calendar
          localCalendar = await this.prisma.calendar.create({
            data: {
              name: gcal.summary || 'Untitled Calendar',
              description: gcal.description,
              color: gcal.backgroundColor || '#3B82F6',
              userId,
              googleCalendarId: gcal.id!,
              syncEnabled: true,
              lastSyncedAt: new Date(),
            },
          });

          imported.push(localCalendar);
        }
      }

      return {
        imported: imported.length,
        calendars: imported,
      };
    } catch (error) {
      this.logger.error('Failed to import Google Calendars', error);
      throw error;
    }
  }

  async syncGoogleCalendarEvents(
    userId: string,
    calendarId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    try {
      const auth = await this.getOAuth2Client(userId);
      const googleCalendar = google.calendar({ version: 'v3', auth });

      // Get local calendar
      const localCalendar = await this.prisma.calendar.findFirst({
        where: { id: calendarId, userId },
      });

      if (!localCalendar || !localCalendar.googleCalendarId) {
        throw new Error('Calendar not found or not linked to Google Calendar');
      }

      // Fetch events from Google Calendar
      const response = await googleCalendar.events.list({
        calendarId: localCalendar.googleCalendarId,
        timeMin: options?.startDate?.toISOString() || new Date().toISOString(),
        timeMax: options?.endDate?.toISOString(),
        maxResults: 250,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const googleEvents = response.data.items || [];
      let imported = 0;
      let updated = 0;

      for (const gevent of googleEvents) {
        if (!gevent.id || !gevent.start || !gevent.summary) continue;

        // Parse start and end dates
        const startDate = gevent.start.dateTime
          ? new Date(gevent.start.dateTime)
          : new Date(gevent.start.date!);
        const endDate = gevent.end?.dateTime
          ? new Date(gevent.end.dateTime)
          : gevent.end?.date
            ? new Date(gevent.end.date)
            : new Date(startDate.getTime() + 3600000); // 1 hour default

        const isAllDay = !gevent.start.dateTime;

        // Check if event already exists
        const existingEvent = await this.prisma.calendarEvent.findFirst({
          where: {
            googleEventId: gevent.id,
            userId,
          },
        });

        if (existingEvent) {
          // Update existing event
          await this.prisma.calendarEvent.update({
            where: { id: existingEvent.id },
            data: {
              title: gevent.summary,
              description: gevent.description,
              location: gevent.location,
              startDate,
              endDate,
              isAllDay,
              timezone: gevent.start.timeZone || 'UTC',
              lastSyncedAt: new Date(),
            },
          });
          updated++;
        } else {
          // Create new event
          await this.prisma.calendarEvent.create({
            data: {
              title: gevent.summary,
              description: gevent.description,
              location: gevent.location,
              startDate,
              endDate,
              isAllDay,
              timezone: gevent.start.timeZone || 'UTC',
              calendarId: localCalendar.id,
              userId,
              googleEventId: gevent.id,
              lastSyncedAt: new Date(),
              reminderMinutes: [15],
            },
          });
          imported++;
        }
      }

      // Update calendar sync time
      await this.prisma.calendar.update({
        where: { id: calendarId },
        data: { lastSyncedAt: new Date() },
      });

      return {
        imported,
        updated,
        total: imported + updated,
      };
    } catch (error) {
      this.logger.error('Failed to sync Google Calendar events', error);
      throw error;
    }
  }

  async exportEventToGoogle(eventId: string, userId: string) {
    try {
      const auth = await this.getOAuth2Client(userId);
      const googleCalendar = google.calendar({ version: 'v3', auth });

      // Get local event
      const event = await this.prisma.calendarEvent.findFirst({
        where: { id: eventId, userId },
        include: { calendar: true },
      });

      if (!event) {
        throw new Error('Event not found');
      }

      if (!event.calendar.googleCalendarId) {
        throw new Error('Calendar not linked to Google Calendar');
      }

      const googleEvent: any = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: event.isAllDay
          ? { date: event.startDate.toISOString().split('T')[0] }
          : {
              dateTime: event.startDate.toISOString(),
              timeZone: event.timezone,
            },
        end: event.isAllDay
          ? { date: event.endDate.toISOString().split('T')[0] }
          : {
              dateTime: event.endDate.toISOString(),
              timeZone: event.timezone,
            },
        reminders: {
          useDefault: false,
          overrides: event.reminderMinutes.map((minutes) => ({
            method: 'popup',
            minutes,
          })),
        },
      };

      let result;
      if (event.googleEventId) {
        // Update existing Google event
        result = await googleCalendar.events.update({
          calendarId: event.calendar.googleCalendarId,
          eventId: event.googleEventId,
          requestBody: googleEvent,
        });
      } else {
        // Create new Google event
        result = await googleCalendar.events.insert({
          calendarId: event.calendar.googleCalendarId,
          requestBody: googleEvent,
        });

        // Update local event with Google event ID
        await this.prisma.calendarEvent.update({
          where: { id: eventId },
          data: {
            googleEventId: result.data.id!,
            lastSyncedAt: new Date(),
          },
        });
      }

      return result.data;
    } catch (error) {
      this.logger.error('Failed to export event to Google Calendar', error);
      throw error;
    }
  }

  async deleteGoogleEvent(eventId: string, userId: string) {
    try {
      const auth = await this.getOAuth2Client(userId);
      const googleCalendar = google.calendar({ version: 'v3', auth });

      const event = await this.prisma.calendarEvent.findFirst({
        where: { id: eventId, userId },
        include: { calendar: true },
      });

      if (!event?.googleEventId || !event.calendar.googleCalendarId) {
        return; // Nothing to delete from Google
      }

      await googleCalendar.events.delete({
        calendarId: event.calendar.googleCalendarId,
        eventId: event.googleEventId,
      });
    } catch (error) {
      this.logger.error('Failed to delete event from Google Calendar', error);
      // Don't throw - allow local deletion to proceed
    }
  }
}
