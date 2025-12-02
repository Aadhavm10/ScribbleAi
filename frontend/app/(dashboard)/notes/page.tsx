'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Note, NotesAPI, CreateNoteDto, UpdateNoteDto } from '../../../lib/api';
import NoteCard from '../../../components/NoteCard';
import NoteEditor from '../../../components/NoteEditor';

export const dynamic = 'force-dynamic';

function AllNotesContent() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');

  const userId = user?.id || 'demo-user';

  const loadNotes = useCallback(async () => {
    try {
      setError(null);
      const fetchedNotes = await NotesAPI.getNotes();
      setNotes(fetchedNotes);
      setFilteredNotes(fetchedNotes);
    } catch (err) {
      setError('Failed to load notes');
      console.error('Error loading notes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for note ID in URL params
  useEffect(() => {
    const noteId = searchParams.get('note');
    if (noteId && notes.length > 0) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setSelectedNote(note);
      }
    }
  }, [searchParams, notes]);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load notes when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadNotes();
    }
  }, [isAuthenticated, authLoading, loadNotes]);

  // Filter and sort notes
  useEffect(() => {
    let filtered = [...notes];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredNotes(filtered);
  }, [notes, searchQuery, sortBy]);

  const handleCreateNote = async (noteData: Omit<CreateNoteDto, 'userId'> | UpdateNoteDto) => {
    try {
      setError(null);
      const newNote = await NotesAPI.createNote({
        title: noteData.title || '',
        content: noteData.content || ''
      });
      setNotes([newNote, ...notes]);
      setIsCreating(false);
    } catch (err) {
      setError('Failed to create note');
      console.error('Error creating note:', err);
    }
  };

  const handleUpdateNote = async (noteData: UpdateNoteDto | Omit<CreateNoteDto, 'userId'>) => {
    if (!editingNote) return;

    try {
      setError(null);
      const updatedNote = await NotesAPI.updateNote(editingNote.id, {
        title: noteData.title,
        content: noteData.content
      });
      setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
      setEditingNote(null);
      if (selectedNote?.id === updatedNote.id) {
        setSelectedNote(updatedNote);
      }
    } catch (err) {
      setError('Failed to update note');
      console.error('Error updating note:', err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      setError(null);
      await NotesAPI.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    } catch (err) {
      setError('Failed to delete note');
      console.error('Error deleting note:', err);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-gray-700 text-lg font-medium">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              All Notes
            </h1>
            <p className="text-slate-600">Manage and organize your notes</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full px-4 py-2.5 pl-11 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updated' | 'created' | 'title')}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          >
            <option value="updated">Sort by Updated</option>
            <option value="created">Sort by Created</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by creating your first note'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreating(true)}
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Create Your First Note
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-slate-600 mb-4">
            Showing {filteredNotes.length} of {notes.length} notes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => setSelectedNote(note)}
                onEdit={() => setEditingNote(note)}
                onDelete={() => handleDeleteNote(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Note Editor Modal - Create (Full Screen) */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] bg-white">
          <NoteEditor
            onSave={handleCreateNote}
            onCancel={() => setIsCreating(false)}
            enableRealtime={false}
          />
        </div>
      )}

      {/* Note Editor Modal - Edit (Full Screen) */}
      {editingNote && (
        <div className="fixed inset-0 z-[100] bg-white">
          <NoteEditor
            note={editingNote}
            onSave={handleUpdateNote}
            onCancel={() => setEditingNote(null)}
            enableRealtime={false}
          />
        </div>
      )}

      {/* Note Viewer Modal */}
      {selectedNote && !editingNote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start p-6 border-b border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-900">{selectedNote.title}</h2>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="bg-slate-50 rounded-lg p-6 mb-6">
                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{selectedNote.content}</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-500">
                  Updated {new Date(selectedNote.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingNote(selectedNote)}
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AllNotesPage() {
  return (
    <Suspense fallback={
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    }>
      <AllNotesContent />
    </Suspense>
  );
}

