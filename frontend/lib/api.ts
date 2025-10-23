const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  static async getNotes(userId: string): Promise<Note[]> {
    const response = await fetch(`${API_BASE_URL}/notes?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }
    return response.json();
  }

  static async getNote(id: string): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch note');
    }
    return response.json();
  }

  static async createNote(note: CreateNoteDto): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });
    if (!response.ok) {
      throw new Error('Failed to create note');
    }
    return response.json();
  }

  static async updateNote(id: string, note: UpdateNoteDto): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });
    if (!response.ok) {
      throw new Error('Failed to update note');
    }
    return response.json();
  }

  static async deleteNote(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
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
}

export interface ConversationalResponse {
  response: string;
  sources: SearchResult[];
  conversationId: string;
}

export class SearchAPI {
  static async conversationalSearch(
    query: string,
    userId: string,
    conversationId?: string,
  ): Promise<ConversationalResponse> {
    const response = await fetch(`${API_BASE_URL}/search/conversational`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, userId, conversationId }),
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }

  static async hybridSearch(
    query: string,
    userId: string,
  ): Promise<SearchResult[]> {
    const response = await fetch(`${API_BASE_URL}/search/hybrid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, userId }),
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
  static async getFolders(userId: string): Promise<Folder[]> {
    const response = await fetch(`${API_BASE_URL}/folders?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch folders');
    }
    return response.json();
  }

  static async getFolderTree(userId: string): Promise<Folder[]> {
    const response = await fetch(`${API_BASE_URL}/folders/tree?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch folder tree');
    }
    return response.json();
  }

  static async getFolderById(id: string): Promise<Folder> {
    const response = await fetch(`${API_BASE_URL}/folders/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch folder');
    }
    return response.json();
  }

  static async createFolder(data: CreateFolderDto): Promise<Folder> {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create folder');
    }
    return response.json();
  }

  static async updateFolder(id: string, data: UpdateFolderDto): Promise<Folder> {
    const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update folder');
    }
    return response.json();
  }

  static async deleteFolder(id: string): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete folder');
    }
    return response.json();
  }

  static async moveNotesToFolder(noteIds: string[], folderId: string | null): Promise<{ success: boolean; count: number }> {
    const response = await fetch(`${API_BASE_URL}/folders/move-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteIds, folderId }),
    });
    if (!response.ok) {
      throw new Error('Failed to move notes');
    }
    return response.json();
  }
}
