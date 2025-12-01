'use client';

import { Note } from '../lib/api';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function NoteCard({ note, onClick, onEdit, onDelete }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer overflow-hidden">
      <div className="p-5" onClick={onClick}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-slate-900 truncate mb-1.5">{note.title}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatDate(note.updatedAt)}</span>
            </div>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              title="Edit note"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete note"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="bg-slate-50/50 rounded-lg border border-slate-100 p-3 mb-3">
          <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
            {truncateContent(note.content)}
          </p>
        </div>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.slice(0, 2).map((noteTag) => (
              <span
                key={noteTag.tag.id}
                className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium"
              >
                #{noteTag.tag.name}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                +{note.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>AI-Enhanced</span>
          </div>
          <div className="text-xs text-slate-400 group-hover:text-indigo-600 transition-colors">
            View →
          </div>
        </div>
      </div>
    </div>
  );
}
