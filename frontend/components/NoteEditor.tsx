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
  const [autoSaving, setAutoSaving] = useState(false);

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
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Google Docs-style toolbar */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20 flex-shrink-0">
        {/* Top bar with collaboration indicators */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Document icon */}
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            </svg>

            {/* Title and status */}
            <div className="flex flex-col min-w-0 flex-1 max-w-lg">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled document"
                className="text-base sm:text-lg font-normal text-gray-900 border-0 focus:outline-none focus:ring-0 p-0 bg-transparent placeholder-gray-400 w-full"
                disabled={isLoading}
              />
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                {realtime?.isConnected ? (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span>Saved to ScribbleAI</span>
                  </>
                ) : autoSaving ? (
                  <span>Saving...</span>
                ) : (
                  <span>Not saved</span>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Collaboration avatars and buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Active collaborators */}
            {realtime && realtime.activeUsers.length > 1 && (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {realtime.activeUsers
                    .filter(u => u.userId !== user?.id)
                    .slice(0, 5)
                    .map((u, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white shadow-sm hover:z-10 transition-transform hover:scale-110"
                        title={u.userName}
                      >
                        {u.userName.charAt(0).toUpperCase()}
                      </div>
                    ))}
                </div>
                {realtime.activeUsers.length > 6 && (
                  <span className="text-xs text-gray-600 font-medium">
                    +{realtime.activeUsers.length - 6}
                  </span>
                )}
              </div>
            )}

            {/* Share button (Google Docs style) */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !title.trim() || !content.trim()}
              className="px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md whitespace-nowrap"
            >
              {isLoading ? 'Saving...' : note ? 'Save' : 'Create'}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Close"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Minimal toolbar */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2 bg-gray-50/50 overflow-x-auto">
          <button type="button" className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0" title="Undo">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button type="button" className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0" title="Redo">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1 flex-shrink-0"></div>
          <button type="button" className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-gray-700 font-medium transition-colors whitespace-nowrap flex-shrink-0">
            Normal text
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1 flex-shrink-0"></div>
          <button type="button" className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0" title="Bold">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
            </svg>
          </button>
          <button type="button" className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0" title="Italic">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
            </svg>
          </button>
          <button type="button" className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0" title="Underline">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Document content area */}
      <div className="flex-1 overflow-y-auto bg-gray-100 py-8">
        <div className="max-w-[816px] mx-auto bg-white shadow-lg min-h-[1056px] p-24">
          {/* Content textarea styled like Google Docs */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing..."
            className="w-full h-full min-h-[900px] border-0 focus:outline-none resize-none text-gray-900 placeholder-gray-400 text-base leading-relaxed font-normal"
            style={{ 
              fontFamily: 'Arial, sans-serif',
              fontSize: '11pt',
              lineHeight: '1.5',
            }}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
