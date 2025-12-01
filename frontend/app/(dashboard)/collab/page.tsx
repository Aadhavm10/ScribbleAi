'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Note, NotesAPI, CreateNoteDto, UpdateNoteDto } from '../../../lib/api';
import NoteEditor from '../../../components/NoteEditor';

export const dynamic = 'force-dynamic';

function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function CollabPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessionCode, setSessionCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleCreateSession = async () => {
    if (!user?.id) return;
    
    try {
      setError(null);
      setIsCreating(true);
      const code = generateSessionCode();
      
      // Create a new collaborative note with session code
      const note = await NotesAPI.createNote({
        title: `Collab Session ${code}`,
        content: `# Welcome to Collab Session ${code}\n\nShare this code with others to collaborate in real-time!\n\nSession Code: **${code}**\n\nStart typing below...`,
        userId: user.id,
        sessionCode: code,
      });

      setSessionCode(code);
      setActiveNote(note);
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create session:', err);
      setError('Failed to create collaboration session');
      setIsCreating(false);
    }
  };

  const handleJoinSession = async () => {
    if (!inputCode.trim()) {
      setError('Please enter a session code');
      return;
    }

    try {
      setError(null);
      const code = inputCode.toUpperCase();
      const sessionNote = await NotesAPI.getNoteBySessionCode(code);

      if (sessionNote) {
        setActiveNote(sessionNote);
        setSessionCode(code);
      } else {
        setError(`Session "${code}" not found. Make sure the code is correct.`);
      }
    } catch (err) {
      console.error('Failed to join session:', err);
      setError('Failed to join session. Please try again.');
    }
  };

  const handleUpdateNote = async (data: UpdateNoteDto) => {
    if (!activeNote) return;
    
    try {
      await NotesAPI.updateNote(activeNote.id, data);
      // Refresh note data
      const updatedNote = await NotesAPI.getNotes().then(notes => 
        notes.find(n => n.id === activeNote.id)
      );
      if (updatedNote) {
        setActiveNote(updatedNote);
      }
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };

  const handleLeaveSession = () => {
    setActiveNote(null);
    setSessionCode('');
    setInputCode('');
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Active session view
  if (activeNote) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        {/* Top bar with session info */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">Live Session</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-slate-600">Code:</span>
                <span className="text-sm font-mono font-semibold text-slate-900">{sessionCode}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sessionCode);
                  }}
                  className="text-indigo-600 hover:text-indigo-700"
                  title="Copy session code"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <button
              onClick={handleLeaveSession}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Leave Session
            </button>
          </div>
        </div>

        {/* Main content area with editor and users sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Note Editor - Main area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <NoteEditor
                note={activeNote}
                onSave={handleUpdateNote}
                onCancel={handleLeaveSession}
                enableRealtime={true}
              />
            </div>
          </div>

          {/* Users Sidebar - Right */}
          <div className="w-72 bg-white border-l border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Active Users</h3>
            <div className="space-y-3">
              {/* Note: Real user list would come from useRealtimeNote hook */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {user?.name || user?.email || 'You'}
                  </div>
                  <div className="text-xs text-slate-500">Host</div>
                </div>
              </div>
              <div className="text-xs text-slate-500 text-center py-4">
                Waiting for others to join...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Session lobby view
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Real-Time Collaboration
          </h1>
          <p className="text-slate-600 text-lg">
            Create or join a session to collaborate with others in real-time
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Create Session */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Create Session
              </h2>
              <p className="text-slate-600 text-sm">
                Start a new collaborative editing session
              </p>
            </div>

            <button
              onClick={handleCreateSession}
              disabled={isCreating}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isCreating ? 'Creating...' : 'Create New Session'}
            </button>

            <div className="mt-6 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600">
                You'll receive a 6-character code to share with collaborators
              </p>
            </div>
          </div>

          {/* Join Session */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Join Session
              </h2>
              <p className="text-slate-600 text-sm">
                Enter a session code to join
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-center text-xl font-mono tracking-wider uppercase focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />

              <button
                onClick={handleJoinSession}
                disabled={inputCode.length !== 6}
                className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Join Session
              </button>
            </div>

            <div className="mt-6 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600">
                Ask your collaborator for their session code
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-lg border border-slate-200">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-semibold mb-2">Real-Time Updates</h3>
            <p className="text-slate-600 text-sm">See changes as they happen instantly</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg border border-slate-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-semibold mb-2">User Presence</h3>
            <p className="text-slate-600 text-sm">See who's editing with live avatars</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-semibold mb-2">Secure Sessions</h3>
            <p className="text-slate-600 text-sm">Private sessions with unique codes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

