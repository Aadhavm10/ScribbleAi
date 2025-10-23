'use client';

import { useState } from 'react';
import { Note, CreateNoteDto, UpdateNoteDto } from '../lib/api';

interface NoteEditorProps {
  note?: Note;
  onSave: (note: CreateNoteDto | UpdateNoteDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function NoteEditor({ note, onSave, onCancel, isLoading }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

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
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full text-xl font-semibold border-0 border-b border-gray-200 bg-transparent pb-2 focus:border-blue-500 focus:outline-none"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note..."
            rows={12}
            className="w-full border border-gray-200 rounded-md p-3 focus:border-blue-500 focus:outline-none resize-none"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
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
