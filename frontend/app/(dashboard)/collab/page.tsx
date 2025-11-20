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
      <div className="p-8 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Session Header */}
          <div className="mb-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white mb-2">
                  Live Collaboration Session
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-400">Live</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                    <span className="text-sm text-gray-400">Session Code:</span>
                    <span className="text-lg font-mono font-bold text-white">{sessionCode}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sessionCode);
                        alert('Session code copied!');
                      }}
                      className="ml-2 text-indigo-400 hover:text-indigo-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLeaveSession}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
              >
                Leave Session
              </button>
            </div>
          </div>

          {/* Collaborative Editor */}
          <NoteEditor
            note={activeNote}
            onSave={handleUpdateNote}
            onCancel={handleLeaveSession}
            enableRealtime={true}
          />
        </div>
      </div>
    );
  }

  // Session lobby view
  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Real-Time Collaboration
          </h1>
          <p className="text-gray-400 text-lg">
            Create or join a session to collaborate with others in real-time
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Session */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Create Session
              </h2>
              <p className="text-gray-400 text-sm">
                Start a new collaborative editing session
              </p>
            </div>

            <button
              onClick={handleCreateSession}
              disabled={isCreating}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
            >
              {isCreating ? 'Creating...' : 'Create New Session'}
            </button>

            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-500">
                You'll receive a 6-character code to share with collaborators
              </p>
            </div>
          </div>

          {/* Join Session */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Join Session
              </h2>
              <p className="text-gray-400 text-sm">
                Enter a session code to join
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl font-mono tracking-widest uppercase focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />

              <button
                onClick={handleJoinSession}
                disabled={inputCode.length !== 6}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
              >
                Join Session
              </button>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-500">
                Ask your collaborator for their session code
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Real-Time Updates</h3>
            <p className="text-gray-500 text-sm">See changes as they happen with 300ms latency</p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">User Presence</h3>
            <p className="text-gray-500 text-sm">See who's editing with live avatars</p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Secure Sessions</h3>
            <p className="text-gray-500 text-sm">Private sessions with unique codes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

