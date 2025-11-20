import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Helper to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getSession() as any;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (session?.backendToken) {
    headers['Authorization'] = `Bearer ${session.backendToken}`;
  }

  return headers;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  parentId?: string | null;
  parent?: Folder | null;
  children?: Folder[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    notes: number;
    children: number;
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  folderId?: string | null;
  folder?: Folder | null;
  sessionCode?: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Array<{
    tag: {
      id: string;
      name: string;
    };
  }>;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  userId: string;
  folderId?: string | null;
  tagIds?: string[];
  sessionCode?: string | null;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  folderId?: string | null;
  tagIds?: string[];
}

export interface AiSummaryResult {
  summary: string;
  keyPoints: string[];
}

export interface AiRephraseResult {
  rephrased: string;
  style: 'formal' | 'casual' | 'concise';
}

export interface AiTasksResult {
  tasks: Array<{
    task: string;
    priority: 'high' | 'medium' | 'low';
    dueDate?: string;
  }>;
}

export class NotesAPI {
  static async getNotes(): Promise<Note[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notes`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }
    return response.json();
  }

  static async getNote(id: string): Promise<Note> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch note');
    }
    return response.json();
  }

  static async getNoteBySessionCode(sessionCode: string): Promise<Note | null> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notes/session/${sessionCode}`, { headers });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error('Failed to fetch collaboration session');
    }
    return response.json();
  }

  static async createNote(note: Omit<CreateNoteDto, 'userId'>): Promise<Note> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(note),
    });
    if (!response.ok) {
      throw new Error('Failed to create note');
    }
    return response.json();
  }

  static async updateNote(id: string, note: UpdateNoteDto): Promise<Note> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(note),
    });
    if (!response.ok) {
      throw new Error('Failed to update note');
    }
    return response.json();
  }

  static async deleteNote(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to delete note');
    }
  }
}

export interface SearchResult {
  noteId: string;
  title: string;
  content: string;
  excerpt: string;
  score: number;
  provider?: string;
  itemType?: string;
  webViewUrl?: string;
  snippet?: string;
}

export interface ConversationalResponse {
  response: string;
  sources: SearchResult[];
  conversationId: string;
}

export class SearchAPI {
  static async conversationalSearch(
    query: string,
    conversationId?: string,
  ): Promise<ConversationalResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/search/conversational`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, conversationId }),
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }

  static async hybridSearch(
    query: string,
    providers?: string[],
  ): Promise<SearchResult[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/search/hybrid`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, providers }),
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }
}

export class AiAPI {
  static async summarizeNote(noteId: string, title: string, content: string): Promise<AiSummaryResult> {
    const response = await fetch(`${API_BASE_URL}/ai/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteId, title, content }),
    });
    if (!response.ok) {
      throw new Error('Failed to summarize note');
    }
    return response.json();
  }

  static async rephraseText(text: string, style: 'formal' | 'casual' | 'concise'): Promise<AiRephraseResult> {
    const response = await fetch(`${API_BASE_URL}/ai/rephrase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, style }),
    });
    if (!response.ok) {
      throw new Error('Failed to rephrase text');
    }
    return response.json();
  }

  static async extractTasks(content: string): Promise<AiTasksResult> {
    const response = await fetch(`${API_BASE_URL}/ai/extract-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      throw new Error('Failed to extract tasks');
    }
    return response.json();
  }
}

export interface CreateFolderDto {
  name: string;
  color?: string;
  icon?: string;
  parentId?: string | null;
  userId: string;
}

export interface UpdateFolderDto {
  name?: string;
  color?: string;
  icon?: string;
  parentId?: string | null;
}

export class FoldersAPI {
  static async getFolders(): Promise<Folder[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/folders`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch folders');
    }
    return response.json();
  }

  static async getFolderTree(): Promise<Folder[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/folders/tree`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch folder tree');
    }
    return response.json();
  }

  static async getFolderById(id: string): Promise<Folder> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/folders/${id}`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch folder');
    }
    return response.json();
  }

  static async createFolder(data: Omit<CreateFolderDto, 'userId'>): Promise<Folder> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create folder');
    }
    return response.json();
  }

  static async updateFolder(id: string, data: UpdateFolderDto): Promise<Folder> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update folder');
    }
    return response.json();
  }

  static async deleteFolder(id: string): Promise<{ id: string }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to delete folder');
    }
    return response.json();
  }

  static async moveNotesToFolder(noteIds: string[], folderId: string | null): Promise<{ success: boolean; count: number }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/folders/move-notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ noteIds, folderId }),
    });
    if (!response.ok) {
      throw new Error('Failed to move notes');
    }
    return response.json();
  }
}

// ==================== Calendar Types and API ====================

export interface Calendar {
  id: string;
  name: string;
  description?: string;
  color: string;
  isDefault: boolean;
  isVisible: boolean;
  userId: string;
  googleCalendarId?: string;
  syncEnabled: boolean;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    events: number;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  color?: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  timezone: string;
  recurrenceRule?: string;
  recurrenceEnd?: string;
  userId: string;
  calendarId: string;
  calendar?: Calendar;
  linkedNoteId?: string;
  linkedNote?: {
    id: string;
    title: string;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color?: string;
    };
  }>;
  reminderMinutes: number[];
  attendees?: Array<{ email: string; name?: string; status?: string }>;
  googleEventId?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
  // For recurring event instances
  originalEventId?: string;
  isRecurringInstance?: boolean;
}

export interface CreateCalendarDto {
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
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
}

export interface UpdateEventDto {
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
}

export interface EventQueryParams {
  calendarIds?: string[];
  startDate?: Date;
  endDate?: Date;
  tagIds?: string[];
  search?: string;
  expand?: boolean;
}

export class CalendarAPI {
  // Calendar operations
  static async getCalendars(): Promise<Calendar[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/calendar/calendars`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch calendars');
    }
    return response.json();
  }

  static async getCalendar(id: string): Promise<Calendar> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/calendar/calendars/${id}`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch calendar');
    }
    return response.json();
  }

  static async createCalendar(data: CreateCalendarDto): Promise<Calendar> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/calendar/calendars`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create calendar');
    }
    return response.json();
  }

  static async updateCalendar(id: string, data: UpdateCalendarDto): Promise<Calendar> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/calendar/calendars/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update calendar');
    }
    return response.json();
  }

  static async deleteCalendar(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/calendar/calendars/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to delete calendar');
    }
  }

  // Event operations
  static async getEvents(params?: EventQueryParams): Promise<CalendarEvent[]> {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();

    if (params?.calendarIds && params.calendarIds.length > 0) {
      queryParams.set('calendarIds', params.calendarIds.join(','));
    }
    if (params?.startDate) {
      queryParams.set('startDate', params.startDate.toISOString());
    }
    if (params?.endDate) {
      queryParams.set('endDate', params.endDate.toISOString());
    }
    if (params?.tagIds && params.tagIds.length > 0) {
      queryParams.set('tagIds', params.tagIds.join(','));
    }
    if (params?.search) {
      queryParams.set('search', params.search);
    }
    if (params?.expand) {
      queryParams.set('expand', 'true');
    }

    const url = `${API_BASE_URL}/calendar/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return response.json();
  }

  static async getEvent(id: string): Promise<CalendarEvent> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/calendar/events/${id}`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }
    return response.json();
  }

  static async createEvent(data: CreateEventDto): Promise<CalendarEvent> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/calendar/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    return response.json();
  }

  static async updateEvent(id: string, data: UpdateEventDto): Promise<CalendarEvent> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/calendar/events/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update event');
    }
    return response.json();
  }

  static async deleteEvent(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/calendar/events/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
  }

  static async duplicateEvent(id: string): Promise<CalendarEvent> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/calendar/events/${id}/duplicate`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to duplicate event');
    }
    return response.json();
  }

  // Google Calendar sync
  static async importGoogleCalendars(): Promise<{ imported: number; calendars: Calendar[] }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/calendar/sync/google/import-calendars`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to import Google Calendars');
    }
    return response.json();
  }

  static async syncGoogleCalendar(
    calendarId: string,
    options?: { startDate?: Date; endDate?: Date },
  ): Promise<{ imported: number; updated: number; total: number }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/calendar/sync/google/calendar/${calendarId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        startDate: options?.startDate?.toISOString(),
        endDate: options?.endDate?.toISOString(),
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to sync Google Calendar');
    }
    return response.json();
  }

  static async exportEventToGoogle(eventId: string): Promise<any> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/calendar/sync/google/event/${eventId}`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to export event to Google Calendar');
    }
    return response.json();
  }
}
