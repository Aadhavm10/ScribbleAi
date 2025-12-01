'use client';

import { useState, useEffect } from 'react';
import { Note, CreateNoteDto, UpdateNoteDto } from '../lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeNote } from '@/hooks/useRealtimeNote';

interface NoteEditorProps {
  note?: Note;
  onSave: (note: CreateNoteDto | UpdateNoteDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  enableRealtime?: boolean;
}

export default function NoteEditor({ note, onSave, onCancel, isLoading, enableRealtime = true }: NoteEditorProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [lastRemoteUpdate, setLastRemoteUpdate] = useState(0);

  // Real-time collaboration (only for existing notes)
  const realtime = note && enableRealtime && user ? useRealtimeNote({
    noteId: note.id,
    userId: user.id,
    userName: user.name || user.email || 'Anonymous',
    userEmail: user.email || '',
    onNoteUpdate: (update) => {
      // Only update if the change came from another user
      if (update.userId !== user.id) {
        if (update.title !== undefined) setTitle(update.title);
        if (update.content !== undefined) setContent(update.content);
        setLastRemoteUpdate(Date.now());
      }
    },
  }) : null;

  // Send real-time updates when content changes
  useEffect(() => {
    if (realtime && note && Date.now() - lastRemoteUpdate > 500) {
      realtime.sendNoteUpdate(title, content);
    }
  }, [title, content, realtime, note, lastRemoteUpdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (note) {
      // Update existing note
      await onSave({ title, content });
    } else {
      // Create new note
      await onSave({ title, content, userId: 'demo-user' });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Real-time collaboration indicator */}
      {realtime && (
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${realtime.isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
            <span className="text-sm font-medium text-slate-700">
              {realtime.isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          {realtime.activeUsers.length > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                {realtime.activeUsers.length - 1} other{realtime.activeUsers.length > 2 ? 's' : ''} editing
              </span>
              <div className="flex -space-x-2">
                {realtime.activeUsers
                  .filter(u => u.userId !== user?.id)
                  .slice(0, 3)
                  .map((u, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm"
                      title={u.userName}
                    >
                      {u.userName.charAt(0).toUpperCase()}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full text-2xl font-semibold border-0 border-b-2 border-slate-200 bg-transparent pb-3 focus:border-indigo-500 focus:outline-none text-slate-900 placeholder-slate-400 transition-colors"
            disabled={isLoading}
          />
        </div>

        <div className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note..."
            rows={14}
            className="w-full border border-slate-200 rounded-lg p-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-all"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-slate-700 font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            disabled={isLoading || !title.trim() || !content.trim()}
          >
            {isLoading ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>
    </div>
  );
}
