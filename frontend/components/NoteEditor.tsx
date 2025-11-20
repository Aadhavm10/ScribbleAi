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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Real-time collaboration indicator */}
      {realtime && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${realtime.isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {realtime.isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          
          {realtime.activeUsers.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {realtime.activeUsers.length - 1} other{realtime.activeUsers.length > 2 ? 's' : ''} editing
              </span>
              <div className="flex -space-x-2">
                {realtime.activeUsers
                  .filter(u => u.userId !== user?.id)
                  .slice(0, 3)
                  .map((u, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-800"
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full text-xl font-semibold border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent pb-2 focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note..."
            rows={12}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-md p-3 focus:border-blue-500 focus:outline-none resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading || !title.trim() || !content.trim()}
          >
            {isLoading ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>
    </div>
  );
}
